import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { createAssistantRoutes } from '../lib/assistant-routes.mjs';
import { AssistantError } from '../lib/assistant-bridge.mjs';
import { mergeLinkedMessages } from '../lib/assistant-linked.mjs';

const entry = (id, value, role = 'user', turnId = 'old-turn', clientId) => ({ turnId, completedAtMs: 1_700_000_000_000, item: role === 'user' ? { id, type: 'userMessage', clientId, content: [{ type: 'text', text: value }] } : { id, type: 'agentMessage', text: value } });

class FakeRpc extends EventEmitter {
  constructor(state, writer = false) { super(); this.state = state; this.writer = writer; this.calls = []; this.responses = []; this.closed = false; }
  async connect() {}
  async request(method, params) {
    this.calls.push({ method, params });
    if (this.state.fail === method) throw new AssistantError('CODEX_REQUEST_FAILED');
    const thread = { id: params.threadId || 'source-one', name: 'Original research', cwd: '/original/research', updatedAt: 1_700_000_000, status: { type: 'notLoaded' } };
    if (method === 'account/read') return { account: { type: 'chatgpt' } };
    if (method === 'thread/list') return { data: [thread, { ...thread, id: 'source-two' }] };
    if (method === 'thread/read') return { thread };
    if (method === 'thread/turns/list') return { data: [{ id: 'old-turn', status: this.state.externalRunning ? 'inProgress' : 'completed' }] };
    if (method === 'thread/items/list') return { data: [...this.state.entries].reverse(), nextCursor: null };
    if (method === 'thread/resume') { if (this.state.locked) throw new AssistantError('SOURCE_THREAD_IN_USE', 409); this.state.locked = true; return { thread, cwd: '/original/research', model: 'original-model', approvalPolicy: 'never', sandbox: { type: 'readOnly' } }; }
    if (method === 'turn/start') {
      const id = `web-turn-${++this.state.turns}`;
      this.state.entries.push(entry(`user-${id}`, params.input[0].text, 'user', id, params.clientUserMessageId));
      this.emit('notification', { method: 'turn/started', params: { threadId: params.threadId, turn: { id, status: 'inProgress' } } });
      return { turn: { id, status: 'inProgress' } };
    }
    return {};
  }
  respond(id, result) { this.responses.push({ id, result }); }
  reject(id) { this.responses.push({ id, rejected: true }); }
  close() { if (this.closed) return; this.closed = true; if (this.writer && this.calls.some(call => call.method === 'turn/start')) this.state.locked = false; this.emit('disconnect', { code: 'CODEX_DISCONNECTED' }); }
}

async function fixture(t) {
  const root = realpathSync(await mkdtemp(resolve(tmpdir(), 'phd-linked-test-'))); const state = { entries: [entry('old-user', 'A real report.'), entry('old-answer', 'Needs evidence.', 'assistant')], turns: 0 };
  const reader = new FakeRpc(state); const writers = [];
  const routes = createAssistantRoutes({ root, dataDir: resolve(root, 'data'), store: { state: () => ({ projects: [{ id: 'project-one' }, { id: 'project-two' }] }) }, rpcFactory: () => reader, linkedRpcFactory: () => { const client = new FakeRpc(state, true); writers.push(client); return client; } });
  const server = createServer((req, res) => routes.handle(req, res, new URL(req.url, 'http://localhost')));
  await new Promise(done => server.listen(0, '127.0.0.1', done)); const origin = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, body) => { const response = await fetch(`${origin}/api/assistant${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { origin, 'content-type': 'application/json', 'accept-language': 'en' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); return { status: response.status, body: await response.json() }; };
  const preview = async (threadIds = ['source-one']) => { await call('/sources/list', {}); return (await call('/sources/preview', { threadIds })).body.preview; };
  const link = async () => call('/sources/link', { previewId: (await preview()).id, projectId: 'project-one', language: 'en' });
  const finish = (id, answer = 'A new answer.') => { const writer = writers.at(-1); const turnId = `web-turn-${state.turns}`; const item = entry(`assistant-${turnId}`, answer, 'assistant', turnId); state.entries.push(item); writer.emit('notification', { method: 'item/completed', params: { threadId: 'source-one', turnId, item: item.item } }); writer.emit('notification', { method: 'turn/completed', params: { threadId: 'source-one', turn: { id: turnId, status: 'completed' } } }); };
  t.after(async () => { routes.close(); await new Promise(done => server.close(done)); await rm(root, { recursive: true, force: true }); });
  return { root, state, reader, writers, routes, call, preview, link, finish };
}

test('link binds one previewed source, reuses its descriptor and does not load a writer or run a model', async t => {
  const f = await fixture(t); const status = await f.call('/status'); assert.deepEqual(status.body.capabilities, { sourceImport: true, linkedChats: true });
  const multi = await f.preview(['source-one', 'source-two']);
  assert.equal((await f.call('/sources/link', { previewId: multi.id, projectId: 'project-one', language: 'en' })).body.code, 'SOURCE_LINK_SINGLE');
  const p = await f.preview(); const request = { previewId: p.id, projectId: 'project-one', language: 'en' };
  const a = await f.call('/sources/link', request); assert.equal(a.status, 200); const c = a.body.conversation;
  assert.equal(c.linkedSource.threadId, 'source-one'); assert.equal(c.linkedSource.cwd, '/original/research'); assert.equal(c.messages.length, 2); assert.equal(c.status, 'idle'); assert.equal(f.writers.length, 0);
  assert.equal((await f.call('/sources/link', request)).body.conversation.id, c.id);
  assert.equal((await f.link()).body.conversation.id, c.id);
  assert.equal((await f.call('/sources/link', { ...request, projectId: 'project-two' })).body.code, 'SOURCE_ALREADY_LINKED');
  assert.equal(f.reader.calls.some(call => /resume|start|fork/.test(call.method)), false);
});

test('selected chat refresh reads new external text once and keeps cached history when sync fails', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  f.state.entries.push(entry('external', 'Later message from Codex.', 'user', 'later-turn'));
  const next = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(next.messages.length, 3); assert.equal(next.messages.at(-1).text, 'Later message from Codex.'); assert.ok(next.linkedSource.syncedAt);
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.messages.length, 3);
  f.state.fail = 'thread/read'; const cached = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(cached.messages.length, 3); assert.match(cached.linkedSource.syncError, /could not be synced/);
  const send = await f.call(`/conversations/${c.id}/messages`, { text: 'Follow up' }); assert.equal(send.body.code, 'SOURCE_SYNC_FAILED'); assert.equal(f.writers.length, 0);
});

test('sending resumes the original ID without settings overrides, binds the target and deduplicates client message IDs', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  const sent = await f.call(`/conversations/${c.id}/messages`, { text: 'Continue our discussion.' }); assert.equal(sent.status, 200);
  const writer = f.writers[0]; assert.deepEqual(writer.calls.find(call => call.method === 'thread/resume').params, { threadId: 'source-one', excludeTurns: true });
  const start = writer.calls.find(call => call.method === 'turn/start').params;
  assert.deepEqual(Object.keys(start).sort(), ['clientUserMessageId', 'input', 'threadId']); assert.ok(start.input[0].text.startsWith('Continue our discussion.\n\n')); assert.equal(start.threadId, 'source-one');
  assert.match(start.input[0].text, /project-one/); assert.match(start.input[0].text, /Ordinary discussion does not authorize writes/); assert.match(start.input[0].text, /Do not inherit a different research-data target/);
  assert.equal(writer.calls.some(call => ['thread/start', 'thread/fork'].includes(call.method)), false);
  f.finish(c.id); await new Promise(done => setImmediate(done)); assert.equal(writer.closed, true);
  const refreshed = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(refreshed.messages.length, 4); assert.equal(refreshed.messages.filter(item => item.text === 'Continue our discussion.').length, 1);
  f.state.entries.push(entry('desktop-followup', 'A later desktop question.', 'user', 'desktop-turn'));
  await f.call(`/conversations/${c.id}/messages`, { text: 'Now continue here.' }); assert.equal(f.writers.length, 2);
  assert.equal(f.writers[1].calls.filter(call => call.method === 'thread/resume').length, 1);
});

test('workflow actions use absolute CLI context while keeping display text simple and original permissions untouched', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  await f.call(`/conversations/${c.id}/messages`, { text: 'Update progress' });
  const start = f.writers[0].calls.find(call => call.method === 'turn/start').params;
  assert.match(start.input[0].text, /project-one/); assert.ok(start.input[0].text.includes(resolve(f.root, 'cli.mjs'))); assert.match(start.input[0].text, /Do not expand access/);
  f.finish(c.id); const refreshed = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.equal(refreshed.messages.filter(item => item.role === 'user').at(-1).text, 'Update progress');
});

test('external running turns and writer locks reject sends without adding a fake user message', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  f.state.externalRunning = true;
  assert.equal((await f.call(`/conversations/${c.id}/messages`, { text: 'Follow up' })).body.code, 'SOURCE_EXTERNAL_BUSY'); assert.equal(f.writers.length, 0);
  f.state.externalRunning = false; f.state.locked = true;
  const locked = await f.call(`/conversations/${c.id}/messages`, { text: 'Follow up' }); assert.equal(locked.status, 409); assert.equal(locked.body.code, 'SOURCE_THREAD_IN_USE');
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.messages.length, 2);
  assert.equal(f.writers[0].calls.some(call => call.method === 'turn/start'), false);
});

test('only the website-owned turn receives approvals or stop and a second local send cannot race', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  await f.call(`/conversations/${c.id}/messages`, { text: 'Continue' }); const writer = f.writers[0];
  assert.equal((await f.call(`/conversations/${c.id}/messages`, { text: 'Concurrent' })).body.code, 'CODEX_BUSY');
  writer.emit('request', { id: 'external-approval', method: 'item/commandExecution/requestApproval', params: { threadId: 'source-one', turnId: 'external-turn', command: 'anything', cwd: '/original/research' } });
  assert.deepEqual(writer.responses, []);
  writer.emit('request', { id: 'own-outside', method: 'item/commandExecution/requestApproval', params: { threadId: 'source-one', turnId: 'web-turn-1', command: 'rm something', cwd: '/original/research' } });
  assert.deepEqual(writer.responses[0], { id: 'own-outside', result: { decision: 'decline' } });
  await f.call(`/conversations/${c.id}/stop`, {});
  assert.deepEqual(writer.calls.find(call => call.method === 'turn/interrupt').params, { threadId: 'source-one', turnId: 'web-turn-1' });
  const previous = writer.calls.filter(call => call.method === 'turn/interrupt').length; await f.call(`/conversations/${c.id}/stop`, {});
  assert.equal(writer.calls.filter(call => call.method === 'turn/interrupt').length, previous);
});

test('Codex rollback removes cached source messages and uses the new authoritative order', async t => {
  const f = await fixture(t); const c = (await f.link()).body.conversation;
  f.state.entries.push(entry('later-user', 'A later question.', 'user', 'later-turn'), entry('later-answer', 'A later answer.', 'assistant', 'later-turn'));
  assert.equal((await f.call(`/conversations/${c.id}`)).body.conversation.messages.length, 4);
  // The original chat rolls back to its first turn and inserts a replacement.
  f.state.entries = [f.state.entries[0], entry('replacement', 'Replacement answer.', 'assistant')];
  const current = (await f.call(`/conversations/${c.id}`)).body.conversation;
  assert.deepEqual(current.messages.map(item => item.text), ['A real report.', 'Replacement answer.']);
});

test('a partial window replaces its overlap, preserves earlier history and keeps unconfirmed local text', () => {
  const message = id => ({ id: `turn:${id}`, sourceItemId: id, turnId: 'turn', role: 'assistant', text: id, at: null });
  const draft = { id: 'local-draft', clientId: 'local-draft', role: 'user', text: 'Unconfirmed', at: null };
  const old = ['older', 'a', 'b', 'removed'].map(message);
  const merged = mergeLinkedMessages([...old, draft], ['inserted', 'b', 'a', 'new'].map(message), { complete: false });
  assert.deepEqual(merged.map(item => item.text), ['older', 'inserted', 'b', 'a', 'new', 'Unconfirmed']);
  const noOverlap = mergeLinkedMessages(old, ['recent-1', 'recent-2'].map(message), { complete: false });
  assert.deepEqual(noOverlap.map(item => item.text), ['recent-1', 'recent-2']);
  const complete = mergeLinkedMessages([...old, draft], [], { complete: true });
  assert.deepEqual(complete, [draft]);
});
