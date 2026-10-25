import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';

export class AssistantError extends Error {
  constructor(code, status = 503) { super(code); this.name = 'AssistantError'; this.code = code; this.status = status; }
}

function rpcError(error, method) {
  const message = typeof error?.message === 'string' ? error.message : '';
  if (/already has an active writer/.test(message)) return new AssistantError('SOURCE_THREAD_IN_USE', 409);
  // Retain only a safe capability category, never raw RPC diagnostics (which
  // can contain local paths, source content or account details).
  const historyMethod = ['thread/items/list', 'thread/turns/list', 'thread/read'].includes(method);
  const unknownMethod = error?.code === -32601 || ([-32600, -32602].includes(error?.code) && message.includes(method) && /unknown variant|unknown method|method not found|unsupported method|not supported|does not support/i.test(message));
  const unsupportedHistory = historyMethod && (message.includes(method) && /(?:thread\/(?:items|turns)\/list|thread\/read) (?:is )?(?:not supported|unsupported)/i.test(message));
  return new AssistantError(unknownMethod || unsupportedHistory ? 'CODEX_METHOD_UNSUPPORTED' : 'CODEX_REQUEST_FAILED');
}

// Only the server operator chooses the executable. It is never accepted from HTTP.
export function findCodexExecutable(env = process.env) {
  const candidates = [...(env.PATH || '').split(delimiter).filter(Boolean).map(path => join(path, process.platform === 'win32' ? 'codex.exe' : 'codex')),
    '/Applications/Codex.app/Contents/Resources/codex',
    '/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex'];
  return candidates.find(path => { try { accessSync(path, constants.X_OK); return true; } catch { return false; } }) || null;
}

// A private stdio connection: no public socket, auth token, or arbitrary RPC proxy.
export class CodexBridge extends EventEmitter {
  constructor({ root, dataDir, executable = findCodexExecutable(), spawnProcess = spawn, timeoutMs = 30_000, env = process.env, preserveThreadConfig = false } = {}) {
    super();
    Object.assign(this, { root, dataDir, executable, spawnProcess, timeoutMs, env, preserveThreadConfig });
    this.pending = new Map(); this.serial = 0; this.child = null; this.ready = false; this.stopping = false;
  }
  async connect() {
    if (this.ready) return;
    if (this.connecting) return this.connecting;
    this.connecting = this.start().finally(() => { this.connecting = null; });
    return this.connecting;
  }
  async start() {
    if (!this.executable) throw new AssistantError('CODEX_NOT_INSTALLED');
    this.stopping = false;
    const environment = this.preserveThreadConfig ? { ...this.env } : { ...this.env, PHD_DATA_DIR: this.dataDir };
    if (this.preserveThreadConfig) delete environment.PHD_DATA_DIR;
    delete environment.OPENAI_API_KEY;
    delete environment.CODEX_API_KEY;
    delete environment.CODEX_THREAD_ID;
    delete environment.CODEX_INTERNAL_ORIGINATOR_OVERRIDE;
    let child;
    try {
      const overrides = this.preserveThreadConfig ? [] : ['-c', 'approval_policy="on-request"', '-c', 'sandbox_mode="workspace-write"', '-c', 'sandbox_workspace_write.network_access=false'];
      child = this.spawnProcess(this.executable, ['app-server', '--listen', 'stdio://', ...overrides],
        { cwd: this.root, env: environment, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true });
    } catch { throw new AssistantError('CODEX_CONNECT_FAILED'); }
    this.child = child;
    let buffer = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      if (this.child !== child) return;
      buffer += chunk;
      if (Buffer.byteLength(buffer) > 8 * 1024 * 1024) { this.disconnect('CODEX_RESPONSE_TOO_LARGE', child); return; }
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).trim(); buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let message; try { message = JSON.parse(line); } catch { this.disconnect('CODEX_PROTOCOL_ERROR', child); return; }
        this.receive(message);
      }
    });
    // Drain diagnostics without exposing account details or command output in server logs.
    child.stderr.on('data', () => {});
    child.stdin.on('error', () => this.disconnect('CODEX_DISCONNECTED', child));
    child.once('error', error => this.disconnect(error.code === 'ENOENT' ? 'CODEX_NOT_INSTALLED' : 'CODEX_CONNECT_FAILED', child));
    child.once('exit', () => this.disconnect('CODEX_DISCONNECTED', child));
    try {
      await this.request('initialize', { clientInfo: { name: 'phd_management', title: 'Research Desk', version: '0.2.0' }, capabilities: { experimentalApi: true } });
      this.notify('initialized', {});
      this.ready = true;
    } catch (error) { this.disconnect(error.code || 'CODEX_CONNECT_FAILED', child); throw error; }
  }
  receive(message) {
    if (!message || typeof message !== 'object') return;
    if (typeof message.method === 'string') {
      this.emit(message.id === undefined ? 'notification' : 'request', message);
      return;
    }
    const waiting = this.pending.get(message.id);
    if (!waiting) return;
    clearTimeout(waiting.timer); this.pending.delete(message.id);
    if (message.error) waiting.reject(rpcError(message.error, waiting.method));
    else waiting.resolve(message.result);
  }
  write(message) {
    if (!this.child || this.child.stdin.destroyed) throw new AssistantError('CODEX_DISCONNECTED');
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }
  request(method, params) {
    if (!this.child) return Promise.reject(new AssistantError('CODEX_DISCONNECTED'));
    const id = ++this.serial;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new AssistantError('CODEX_TIMEOUT')); this.disconnect('CODEX_TIMEOUT'); }, this.timeoutMs);
      timer.unref?.();
      this.pending.set(id, { resolve, reject, timer, method });
      try { this.write({ id, method, params }); }
      catch (error) { clearTimeout(timer); this.pending.delete(id); reject(error); }
    });
  }
  notify(method, params) { this.write({ method, params }); }
  respond(id, result) { this.write({ id, result }); }
  reject(id) { this.write({ id, error: { code: -32601, message: 'This action is not supported by Research Desk.' } }); }
  disconnect(code = 'CODEX_DISCONNECTED', expected = this.child) {
    if (!expected || expected !== this.child) return;
    this.child = null; this.ready = false;
    for (const waiter of this.pending.values()) { clearTimeout(waiter.timer); waiter.reject(new AssistantError(code)); }
    this.pending.clear();
    try { expected.stdin.end(); } catch {}
    this.kill(expected, 'SIGTERM');
    const killer = setTimeout(() => this.kill(expected, 'SIGKILL'), 700); killer.unref?.();
    this.emit('disconnect', new AssistantError(code));
  }
  kill(child, signal) {
    try {
      if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, signal);
      else child.kill(signal);
    } catch {}
  }
  close() { this.stopping = true; this.disconnect(); }
}
