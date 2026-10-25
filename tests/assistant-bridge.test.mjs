import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { CodexBridge } from '../lib/assistant-bridge.mjs';

function childFixture() {
  const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = signal => { child.killedWith = signal; };
  const messages = []; let buffer = '';
  child.stdin.on('data', chunk => { buffer += chunk; let end; while ((end = buffer.indexOf('\n')) >= 0) { const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1); messages.push(message); if (message.method === 'initialize') queueMicrotask(() => child.stdout.write(`${JSON.stringify({ id: message.id, result: {} })}\n`)); } });
  return { child, messages };
}

test('bridge starts a private stdio child with pinned environment and completes initialization', async t => {
  const f = childFixture(); let spawnArgs;
  const bridge = new CodexBridge({ executable: '/local/codex', root: '/project', dataDir: '/data', env: { PATH: '/bin', CODEX_THREAD_ID: 'parent', OPENAI_API_KEY: 'private' }, spawnProcess: (...args) => { spawnArgs = args; return f.child; } });
  t.after(() => bridge.close());
  await bridge.connect();
  assert.equal(bridge.ready, true); assert.equal(spawnArgs[0], '/local/codex'); assert.equal(spawnArgs[2].cwd, '/project'); assert.equal(spawnArgs[2].env.PHD_DATA_DIR, '/data'); assert.equal(spawnArgs[2].env.CODEX_THREAD_ID, undefined);
  assert.ok(spawnArgs[1].includes('stdio://')); assert.equal(f.messages[0].method, 'initialize'); assert.equal(f.messages[1].method, 'initialized');
  const pending = bridge.request('account/read', { refreshToken: false });
  const request = f.messages.at(-1); const json = JSON.stringify({ id: request.id, result: { account: { type: 'chatgpt' } } });
  f.child.stdout.write(json.slice(0, 12)); f.child.stdout.write(`${json.slice(12)}\n`);
  assert.equal((await pending).account.type, 'chatgpt');
});

test('bridge routes notifications and requests and redacts RPC errors', async t => {
  const f = childFixture(); const bridge = new CodexBridge({ executable: 'codex', spawnProcess: () => f.child }); t.after(() => bridge.close());
  await bridge.connect(); const observed = [];
  bridge.on('notification', message => observed.push(message)); bridge.on('request', message => observed.push(message));
  f.child.stdout.write('{"method":"turn/started","params":{}}\n{"id":77,"method":"item/tool/requestUserInput","params":{}}\n');
  assert.equal(observed.length, 2); bridge.respond(77, { answers: {} }); assert.deepEqual(f.messages.at(-1), { id: 77, result: { answers: {} } });
  const pending = bridge.request('thread/start', {}); const id = f.messages.at(-1).id;
  f.child.stdout.write(`${JSON.stringify({ id, error: { message: 'token=SECRET' } })}\n`);
  await assert.rejects(pending, error => error.code === 'CODEX_REQUEST_FAILED' && !error.message.includes('SECRET'));
});

test('linked writers inherit Codex configuration without workspace overrides and safely identify writer locks', async t => {
  const f = childFixture(); let spawnArgs;
  const bridge = new CodexBridge({ executable: '/local/codex', root: '/project', dataDir: '/data', preserveThreadConfig: true, env: { PATH: '/bin', PHD_DATA_DIR: '/server-data', CODEX_THREAD_ID: 'parent' }, spawnProcess: (...args) => { spawnArgs = args; return f.child; } });
  t.after(() => bridge.close()); await bridge.connect();
  assert.deepEqual(spawnArgs[1], ['app-server', '--listen', 'stdio://']);
  assert.equal(spawnArgs[2].env.PHD_DATA_DIR, undefined); assert.equal(spawnArgs[2].env.CODEX_THREAD_ID, undefined);
  const pending = bridge.request('thread/resume', { threadId: 'selected' });
  f.child.stdout.write(`${JSON.stringify({ id: f.messages.at(-1).id, error: { code: -32600, message: 'thread selected already has an active writer: PRIVATE_PATH' } })}\n`);
  await assert.rejects(pending, error => error.code === 'SOURCE_THREAD_IN_USE' && error.status === 409 && !error.message.includes('PRIVATE_PATH'));
});

test('disconnect rejects outstanding calls and malformed protocol stops the owned child', async () => {
  const f = childFixture(); const bridge = new CodexBridge({ executable: 'codex', spawnProcess: () => f.child }); await bridge.connect();
  const pending = bridge.request('thread/start', {}); f.child.stdout.write('not-json\n');
  await assert.rejects(pending, { code: 'CODEX_PROTOCOL_ERROR' });
  assert.equal(bridge.ready, false); assert.equal(f.child.killedWith, 'SIGTERM'); assert.equal(bridge.pending.size, 0);
});

test('timeouts disconnect and missing executables fail without starting anything', async () => {
  const missing = new CodexBridge({ executable: null }); await assert.rejects(missing.connect(), { code: 'CODEX_NOT_INSTALLED' });
  const f = childFixture(); const bridge = new CodexBridge({ executable: 'codex', spawnProcess: () => f.child, timeoutMs: 15 }); await bridge.connect();
  const pending = assert.rejects(bridge.request('thread/start', {}), { code: 'CODEX_TIMEOUT' }); await delay(30); await pending;
  assert.equal(bridge.child, null); assert.equal(bridge.pending.size, 0);
});
