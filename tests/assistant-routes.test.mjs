import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createAssistantRoutes } from '../lib/assistant-routes.mjs';

class FakeRpc extends EventEmitter {
  constructor() { super(); this.calls = []; this.answers = []; this.serial = 0; this.account = { type: 'chatgpt' }; }
  async connect() { this.connections = (this.connections || 0) + 1; }
  async request(method, params) {
    this.calls.push({ method, params });
    if (this.failMethod === method) throw new Error('secret token must not leak');
    if (method === 'account/read') return { account: this.account };
    if (method === 'thread/start' || method === 'thread/resume') return { thread: { id: params.threadId || `thread-${++this.serial}` }, cwd: params.cwd, approvalPolicy: 'on-request', modelProvider: 'openai', sandbox: { type: 'workspaceWrite', networkAccess: false, writableRoots: [] } };
    if (method === 'turn/start') { const turn = { id: `turn-${++this.serial}`, status: 'inProgress' }; this.emit('notification', { method: 'turn/started', params: { threadId: params.threadId, turn } }); return { turn }; }
    return {};
  }
  respond(id, result) { this.answers.push({ id, result }); }
  reject(id) { this.answers.push({ id, rejected: true }); }
  close() { this.emit('disconnect', { code: 'CODEX_DISCONNECTED' }); }
}
async function fixture(t, options = {}) {
  const directory = realpathSync(options.directory || await mkdtemp(resolve(tmpdir(), 'phd-assistant-test-')));
  const root = directory; const dataDir = resolve(directory, 'data'); const rpc = new FakeRpc();
  const routes = createAssistantRoutes({ root, dataDir, store: { state: () => ({ projects: [{ id: 'project-one', title: '真实项目' }] }) }, rpcFactory: () => rpc, ...options, directory: undefined });
  const server = createServer(async (req, res) => { if (!await routes.handle(req, res, new URL(req.url, 'http://localhost'))) { res.writeHead(404); res.end(); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, body, extra = {}) => { const response = await fetch(`${origin}/api/assistant${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : { 'content-type': 'application/json', origin }), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); return { status: response.status, body: await response.json() }; };
  t.after(async () => { routes.close(); await new Promise(resolve => server.close(resolve)); if (!options.keep) await rm(directory, { recursive: true, force: true }); });
  const create = async (props = {}) => (await call('/conversations', { language: 'en', ...props })).body.conversation;
  const send = async (id, props = {}) => call(`/conversations/${id}/messages`, { text: 'Review my actual progress.', ...props });
  const currentTurn = () => rpc.calls.findLast(item => item.method === 'turn/start');
  return { rpc, routes, call, create, send, currentTurn, directory, dataDir };
}

test('read-only endpoints are lazy and conversations persist with private permissions', async t => {
  const f = await fixture(t);
  assert.equal((await f.call('/status')).body.connected, false);
  assert.deepEqual((await f.call('/conversations')).body, { conversations: [] });
  assert.equal(f.rpc.calls.length, 0);
  assert.equal(existsSync(resolve(f.dataDir, 'assistant')), false);
  const c = await f.create({ projectId: 'project-one', title: 'Paper' });
  assert.equal(c.status, 'idle'); assert.equal(c.projectId, 'project-one');
  const file = resolve(f.dataDir, 'assistant/conversations.json');
  assert.equal((await stat(file)).mode & 0o777, 0o600);
  assert.equal((await stat(resolve(f.dataDir, 'assistant'))).mode & 0o777, 0o700);
  assert.equal(JSON.parse(await readFile(file, 'utf8')).conversations[0].id, c.id);
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.title, 'Paper');
});

test('rejects cross-origin, alternate local-origin, missing browser Origin and arbitrary config fields', async t => {
  const f = await fixture(t);
  for (const headers of [{ origin: 'https://evil.test' }, { origin: 'null' }, { origin: 'http://localhost:1234' }, { 'sec-fetch-site': 'cross-site' }]) assert.equal((await f.call('/connect', {}, headers)).status, 403);
  assert.equal((await f.call('/connect', {}, { origin: '', 'sec-fetch-mode': 'cors' })).status, 403);
  assert.equal((await f.call('/connect', { cwd: '/tmp' })).status, 400);
  assert.equal((await f.call('/conversations', { language: 'en', model: 'other' })).status, 400);
  assert.equal((await f.call('/conversations', { language: 'en', projectId: 'missing' })).status, 400);
  assert.equal(f.rpc.calls.length, 0);
});

test('sends fixed workspace, data directory and skills while streaming only owned conversation text', async t => {
  const f = await fixture(t); const c = await f.create({ projectId: 'project-one' });
  assert.equal((await f.send(c.id, { text: '今天完成了真实实验。', action: 'progress' })).status, 200);
  const start = f.rpc.calls.find(item => item.method === 'thread/start').params;
  assert.equal(start.cwd, f.directory); assert.equal(start.sandbox, 'workspace-write'); assert.equal(start.approvalPolicy, 'on-request');
  assert.equal(start.config.shell_environment_policy.set.PHD_DATA_DIR, f.dataDir);
  const turn = f.currentTurn().params;
  assert.equal(turn.approvalPolicy, 'on-request'); assert.equal(turn.sandboxPolicy.type, 'workspaceWrite'); assert.equal(turn.sandboxPolicy.networkAccess, false);
  assert.deepEqual(turn.sandboxPolicy.writableRoots, [f.directory, f.dataDir]);
  assert.match(turn.input[0].text, /phd-progress\/SKILL.en.md/); assert.match(turn.input[0].text, /project-one/); assert.match(turn.input[0].text, /今天完成了真实实验/);
  f.rpc.emit('notification', { method: 'item/agentMessage/delta', params: { threadId: 'foreign', turnId: 'turn-2', itemId: 'other', delta: 'hidden' } });
  const params = { threadId: turn.threadId, turnId: 'turn-2', itemId: 'reply' };
  f.rpc.emit('notification', { method: 'item/agentMessage/delta', params: { ...params, delta: 'First ' } });
  f.rpc.emit('notification', { method: 'item/agentMessage/delta', params: { ...params, delta: 'reply' } });
  let view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(view.messages.at(-1).text, 'First reply'); assert.equal(view.messages.length, 2); assert.equal(view.threadId, undefined);
  f.rpc.emit('notification', { method: 'turn/completed', params: { threadId: turn.threadId, turn: { id: 'turn-2', status: 'completed' } } });
  view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(view.status, 'completed'); assert.equal((await f.call('/status')).body.runningCount, 0);
});

test('same-conversation sends and the fourth concurrent conversation are rejected', async t => {
  const f = await fixture(t); const ids = [];
  for (let i = 0; i < 4; i++) ids.push((await f.create()).id);
  await Promise.all(ids.slice(0, 3).map(id => f.send(id)));
  assert.equal((await f.send(ids[0])).status, 409);
  assert.equal((await f.send(ids[3])).status, 409);
  assert.equal((await f.call('/status')).body.runningCount, 3);
  const stopped = await f.call(`/conversations/${ids[0]}/stop`, {});
  assert.equal(stopped.body.conversation.status, 'interrupted');
  assert.equal((await f.send(ids[3])).status, 200);
});

test('approvals are one-time, bound to the current conversation and turn, and cannot grant expanded access', async t => {
  const f = await fixture(t); const c = await f.create(); const other = await f.create(); await f.send(c.id);
  const common = { threadId: f.currentTurn().params.threadId, turnId: 'turn-2', itemId: 'exec', cwd: f.directory, command: 'node cli.mjs state' };
  f.rpc.emit('request', { id: 50, method: 'item/commandExecution/requestApproval', params: common });
  let view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(view.status, 'waiting'); const id = view.pendingRequests[0].id;
  assert.equal((await f.call(`/conversations/${other.id}/requests/${id}`, { decision: 'accept' })).status, 409);
  assert.equal((await f.call(`/conversations/${c.id}/requests/${id}`, { decision: 'acceptForSession' })).status, 400);
  assert.equal((await f.call(`/conversations/${c.id}/requests/${id}`, { decision: 'accept' })).status, 200);
  assert.deepEqual(f.rpc.answers.at(-1), { id: 50, result: { decision: 'accept' } });
  assert.equal((await f.call(`/conversations/${c.id}/requests/${id}`, { decision: 'accept' })).status, 409);
  f.rpc.emit('request', { id: 51, method: 'item/commandExecution/requestApproval', params: { ...common, turnId: 'old-turn' } });
  assert.deepEqual(f.rpc.answers.at(-1), { id: 51, result: { decision: 'decline' } });
  f.rpc.emit('request', { id: 52, method: 'item/permissions/requestApproval', params: { ...common, permissions: { network: { enabled: true } } } });
  assert.deepEqual(f.rpc.answers.at(-1), { id: 52, result: { permissions: {}, scope: 'turn' } });
  f.rpc.emit('request', { id: 53, method: 'item/commandExecution/requestApproval', params: { ...common, cwd: '/etc' } });
  assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
  f.rpc.emit('request', { id: 54, method: 'item/fileChange/requestApproval', params: { ...common, grantRoot: '/etc' } });
  assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
});

test('input requests accept answers and stop resolves any outstanding request', async t => {
  const f = await fixture(t); const c = await f.create(); await f.send(c.id);
  const request = id => f.rpc.emit('request', { id, method: 'item/tool/requestUserInput', params: { threadId: f.currentTurn().params.threadId, turnId: 'turn-2', itemId: 'input', questions: [{ id: 'result', header: 'Evidence', question: 'What happened?', options: [] }] } });
  request(60); let view = (await f.call(`/conversations/${c.id}`)).body.conversation; let id = view.pendingRequests[0].id;
  assert.equal((await f.call(`/conversations/${c.id}/requests/${id}`, { decision: 'accept', answers: {} })).status, 400);
  const answers = { result: { answers: ['Completed with evidence in results.csv.'] } };
  assert.equal((await f.call(`/conversations/${c.id}/requests/${id}`, { decision: 'accept', answers })).status, 200);
  assert.deepEqual(f.rpc.answers.at(-1), { id: 60, result: { answers } });
  request(61); await f.call(`/conversations/${c.id}/stop`, {});
  assert.deepEqual(f.rpc.answers.at(-1), { id: 61, result: { answers: {} } });
  view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(view.status, 'interrupted'); assert.equal(view.pendingRequests.length, 0);
});

test('failure and disconnect never claim completion; history resumes only its stored thread', async t => {
  const f = await fixture(t, { keep: true }); const c = await f.create(); await f.send(c.id);
  const threadId = f.currentTurn().params.threadId;
  f.rpc.emit('notification', { method: 'turn/completed', params: { threadId, turn: { id: 'turn-2', status: 'failed' } } });
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.status, 'error');
  await f.send(c.id); f.rpc.close();
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.status, 'interrupted');
  f.routes.close();
  const next = await fixture(t, { directory: f.directory });
  assert.equal((await next.call(`/conversations/${c.id}`)).body.conversation.status, 'interrupted');
  await next.send(c.id, { text: 'Continue' });
  assert.equal(next.rpc.calls.some(item => item.method === 'thread/start'), false);
  assert.equal(next.rpc.calls.find(item => item.method === 'thread/resume').params.threadId, threadId);
});

test('missing ChatGPT login and API-key configuration do not run a model or leak credentials', async t => {
  const f = await fixture(t); const c = await f.create();
  f.rpc.account = null;
  assert.equal((await f.send(c.id)).body.code, 'CODEX_NOT_LOGGED_IN');
  f.rpc.account = { type: 'apiKey', token: 'a-secret' }; await f.call('/connect', {});
  const reply = await f.send(c.id);
  assert.equal(reply.body.code, 'CODEX_CHATGPT_REQUIRED');
  assert.equal(f.rpc.calls.some(item => item.method === 'turn/start'), false);
  assert.equal(JSON.stringify((await f.call('/status')).body).includes('a-secret'), false);
});

test('text size, action enum and JSON fields are validated before dispatch', async t => {
  const f = await fixture(t); const c = await f.create();
  assert.equal((await f.send(c.id, { text: '字'.repeat(350000) })).status, 413);
  assert.equal((await f.send(c.id, { action: 'run_shell' })).status, 400);
  assert.equal((await f.send(c.id, { cwd: '/tmp' })).status, 400);
  assert.equal((await f.send(c.id, { text: '' })).status, 400);
  assert.equal(f.rpc.calls.length, 0);
});

test('shell approvals reject unrestricted commands, globs, redirects and stdin writes', async t => {
  const f = await fixture(t); const c = await f.create(); await f.send(c.id);
  const common = { threadId: f.currentTurn().params.threadId, turnId: 'turn-2', itemId: 'shell', cwd: f.directory };
  const commands = ['touch /tmp/outside', 'node cli.mjs state; rm -rf /tmp/other', 'node cli.mjs export --file outputs/*.json', 'node cli.mjs state > output.json', 'node cli.mjs state\ncat /etc/passwd', null];
  for (let index = 0; index < commands.length; index++) {
    f.rpc.emit('request', { id: 70 + index, method: 'item/commandExecution/requestApproval', params: { ...common, command: commands[index] } });
    assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
  }
  f.rpc.emit('request', { id: 79, method: 'item/commandExecution/requestApproval', params: { ...common, kind: 'writeStdin', command: 'node cli.mjs state' } });
  assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.pendingRequests.length, 0);
});

test('file approvals include changes and reject symlink parents and move destinations outside the workspace', async t => {
  const { mkdir, symlink } = await import('node:fs/promises');
  const f = await fixture(t); const c = await f.create(); await f.send(c.id);
  const outside = await mkdtemp(resolve(tmpdir(), 'phd-assistant-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await mkdir(resolve(f.directory, 'results')); await symlink(outside, resolve(f.directory, 'results/escape'));
  const common = { threadId: f.currentTurn().params.threadId, turnId: 'turn-2', itemId: 'patch' };
  const change = changes => f.rpc.emit('notification', { method: 'item/started', params: { ...common, item: { id: 'patch', type: 'fileChange', changes } } });
  change([{ path: resolve(f.directory, 'notes.md'), kind: { type: 'update' }, diff: '+ Real evidence' }]);
  f.rpc.emit('request', { id: 80, method: 'item/fileChange/requestApproval', params: common });
  let view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.match(view.pendingRequests[0].description, /Real evidence/);
  await f.call(`/conversations/${c.id}/requests/${view.pendingRequests[0].id}`, { decision: 'decline' });
  for (const changes of [
    [{ path: resolve(f.directory, 'results/escape/new.md'), kind: { type: 'add' } }],
    [{ path: resolve(f.directory, 'notes.md'), kind: { type: 'update', move_path: resolve(outside, 'notes.md') } }],
  ]) {
    change(changes); f.rpc.emit('request', { id: 81, method: 'item/fileChange/requestApproval', params: common });
    assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
  }
  f.rpc.emit('request', { id: 82, method: 'item/commandExecution/requestApproval', params: { ...common, cwd: f.directory, command: 'node cli.mjs export --file results/escape/new.json' } });
  assert.equal(f.rpc.answers.at(-1).result.decision, 'decline');
});

test('unanswered approvals expire as declined and free the waiting state', async t => {
  const f = await fixture(t, { requestTimeoutMs: 20 }); const c = await f.create(); await f.send(c.id);
  f.rpc.emit('request', { id: 90, method: 'item/commandExecution/requestApproval', params: { threadId: f.currentTurn().params.threadId, turnId: 'turn-2', itemId: 'command', cwd: f.directory, command: 'node cli.mjs state' } });
  await new Promise(resolve => setTimeout(resolve, 35));
  assert.deepEqual(f.rpc.answers.at(-1), { id: 90, result: { decision: 'decline' } });
  const view = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(view.status, 'running'); assert.equal(view.pendingRequests.length, 0);
});

test('stopping during startup prevents a later turn from being launched', async t => {
  const f = await fixture(t); const c = await f.create();
  const original = f.rpc.request.bind(f.rpc); let release; let reached;
  const started = new Promise(resolve => { reached = resolve; });
  f.rpc.request = async (method, params) => { const value = await original(method, params); if (method === 'thread/start') { reached(); await new Promise(resolve => { release = resolve; }); } return value; };
  const sending = f.send(c.id); await started;
  await f.call(`/conversations/${c.id}/stop`, {}); release(); await sending;
  assert.equal(f.rpc.calls.some(item => item.method === 'turn/start'), false);
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.status, 'interrupted');
});
