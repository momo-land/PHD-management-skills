import test from 'node:test';
import assert from 'node:assert/strict';
import { AssistantError } from '../lib/assistant-bridge.mjs';
import { openCodexHistory } from '../lib/assistant-history.mjs';
import { createAssistantSources, SOURCE_LIMITS } from '../lib/assistant-sources.mjs';
import { readLinkedSnapshot } from '../lib/assistant-linked.mjs';

const id = 'original-chat';
const metadata = () => ({ id, name: 'Original research', cwd: 'C:\\Research\\study', updatedAt: 1_700_000_000, status: { type: 'notLoaded' } });
const user = (id, text = id) => ({ id, type: 'userMessage', clientId: `client-${id}`, content: [{ type: 'text', text }] });
const agent = (id, text = id) => ({ id, type: 'agentMessage', text });
const turn = (id, items, status = 'completed') => ({ id, items, status, startedAt: 1_700_000_000, completedAt: 1_700_000_100 });
const unsupported = () => { throw new AssistantError('CODEX_METHOD_UNSUPPORTED'); };

function fixture(handler) {
  const calls = [];
  const rpc = { request: async (method, params) => {
    calls.push({ method, params });
    assert.ok(['thread/list', 'thread/read', 'thread/items/list', 'thread/turns/list'].includes(method), `History reads must not mutate Codex: ${method}`);
    if (method === 'thread/list') return { data: [metadata()], nextCursor: null };
    if (method === 'thread/read' && !params.includeTurns) return { thread: metadata() };
    return handler(method, params);
  } };
  const sources = createAssistantSources({ rpc, ensureConnected: async () => {} });
  const preview = async () => {
    await sources.list({});
    const result = await sources.preview({ threadIds: [id] }, 'en');
    return { ...result, material: sources.getPreview(result.preview.id).material[0] };
  };
  return { rpc, calls, sources, preview };
}

function legacyFixture(turns) {
  return fixture((method, params) => {
    if (method === 'thread/read' && params.includeTurns) return { thread: { ...metadata(), turns } };
    return unsupported();
  });
}

test('legacy previews retain chronological original text across turn chunks, omit tools and leave message dates unknown', async () => {
  const first = turn('first-turn', [user('first-user', 'Original report.'), agent('first-answer', 'An AI suggestion.')]);
  const second = turn('second-turn', [
    user('second-user', 'A newer report.'),
    { id: 'private-tool', type: 'commandExecution', aggregatedOutput: 'PRIVATE TOOL OUTPUT' },
    ...Array.from({ length: 12 }, (_, i) => agent(`answer-${i}`)),
  ]);
  const f = legacyFixture([first, second]);
  const { preview, material } = await f.preview();
  assert.deepEqual(material.messages.map(item => item.id), ['first-user', 'first-answer', 'second-user', ...Array.from({ length: 12 }, (_, i) => `answer-${i}`)]);
  assert.equal(material.messages.at(-1).turnId, 'second-turn');
  assert.equal(material.messages.every(item => item.startedAt === null && item.completedAt === null), true);
  assert.match(preview.text, /User · Date unknown\nOriginal report\./);
  assert.doesNotMatch(preview.text, /PRIVATE TOOL OUTPUT|2023-/);
  assert.deepEqual(preview.sources[0].omittedKinds, ['tools-or-other-items']);
  assert.equal(preview.truncated, false);
  assert.equal(f.calls.filter(call => call.method === 'thread/read' && call.params.includeTurns).length, 1);
  assert.equal(f.calls.filter(call => call.method === 'thread/turns/list')[0].params.itemsView, 'full');
});

test('full-turn pagination works when item pagination is unsupported without loading all legacy history', async () => {
  const older = turn('older-turn', [user('older-user'), agent('older-answer')]);
  const newer = turn('newer-turn', Array.from({ length: 13 }, (_, i) => user(`newer-${i}`)));
  const f = fixture((method, params) => {
    if (method === 'thread/items/list') return unsupported();
    assert.equal(method, 'thread/turns/list');
    assert.equal(params.itemsView, 'full');
    return params.cursor ? { data: [older], nextCursor: null } : { data: [newer], nextCursor: 'older-page' };
  });
  const { preview, material } = await f.preview();
  assert.deepEqual(material.messages.map(item => item.id), ['older-user', 'older-answer', ...Array.from({ length: 13 }, (_, i) => `newer-${i}`)]);
  assert.equal(preview.truncated, false);
  assert.equal(f.calls.filter(call => call.method === 'thread/turns/list').length, 2);
  assert.equal(f.calls.some(call => call.method === 'thread/read' && call.params.includeTurns), false);
});

test('legacy linked snapshots detect an active turn despite notLoaded metadata and retain client IDs for deduplication', async () => {
  for (const status of ['inProgress', 'completed']) {
    const f = legacyFixture([turn('original-turn', [user('report'), agent('answer')], status)]);
    const snapshot = await readLinkedSnapshot(f.rpc, id);
    assert.equal(snapshot.source.externalRunning, status === 'inProgress');
    assert.deepEqual(snapshot.messages.map(item => item.text), ['report', 'answer']);
    assert.equal(snapshot.messages[0].id, 'original-turn:report');
    assert.equal(snapshot.messages[0].sourceItemId, 'report');
    assert.equal(snapshot.messages[0].clientId, 'client-report');
    assert.equal(snapshot.messages[0].at, null);
    assert.equal(snapshot.complete, true);
    assert.equal(f.calls.some(call => call.method === 'thread/items/list'), false);
  }
});

test('legacy previews and linked snapshots keep only the newest bounded window of a long turn', async () => {
  const turns = [turn('long-turn', Array.from({ length: 211 }, (_, i) => user(`message-${i}`)))];
  const previewFixture = legacyFixture(turns);
  const { preview, material } = await previewFixture.preview();
  assert.equal(material.messages.length, SOURCE_LIMITS.maxItemsPerThread);
  assert.equal(material.messages[0].id, 'message-11');
  assert.equal(material.messages.at(-1).id, 'message-210');
  assert.equal(preview.truncated, true);
  const linkedFixture = legacyFixture(turns);
  const snapshot = await readLinkedSnapshot(linkedFixture.rpc, id);
  assert.equal(snapshot.messages.length, SOURCE_LIMITS.maxItemsPerThread);
  assert.equal(snapshot.messages[0].sourceItemId, 'message-11');
  assert.equal(snapshot.source.truncated, true);
  assert.equal(snapshot.complete, false);
});

test('legacy fallback preserves per-message and shared text budgets', async () => {
  const turns = [turn('large-text-turn', Array.from({ length: 15 }, (_, i) => user(`large-${i}`, 'X'.repeat(30_000))))];
  const { preview, material } = await legacyFixture(turns).preview();
  const snapshot = await readLinkedSnapshot(legacyFixture(turns).rpc, id);
  for (const messages of [material.messages, snapshot.messages]) {
    assert.equal(messages.reduce((length, item) => length + item.text.length, 0), SOURCE_LIMITS.maxTextChars);
    assert.equal(messages.every(item => item.text.length === SOURCE_LIMITS.maxMessageChars && item.truncated), true);
    assert.equal(messages.at(-1).text.length, SOURCE_LIMITS.maxMessageChars);
  }
  assert.equal(preview.truncated, true);
  assert.equal(snapshot.source.truncated, true);
  assert.equal(snapshot.complete, false);
});

test('full-turn pagination is bounded even if each turn contains no display text', async () => {
  let count = 0;
  const f = fixture(method => {
    if (method === 'thread/items/list') return unsupported();
    assert.equal(method, 'thread/turns/list');
    return { data: [turn(`empty-${count}`, [])], nextCursor: `page-${++count}` };
  });
  await f.sources.list({});
  const { preview } = await f.sources.preview({ threadIds: [id] });
  assert.equal(count, 20);
  assert.equal(preview.messageCount, 0);
  assert.equal(preview.truncated, true);
});

test('generic history failures do not trigger another compatibility path or become version advice', async () => {
  for (const stage of ['items', 'turns', 'legacy']) {
    const f = fixture((method, params) => {
      if (method === 'thread/items/list') return stage === 'items' ? Promise.reject(new AssistantError('CODEX_REQUEST_FAILED')) : unsupported();
      if (method === 'thread/turns/list') return stage === 'turns' ? Promise.reject(new AssistantError('CODEX_REQUEST_FAILED')) : unsupported();
      assert.equal(method, 'thread/read'); assert.equal(params.includeTurns, true);
      throw new AssistantError('CODEX_REQUEST_FAILED');
    });
    await assert.rejects(f.preview(), { code: 'SOURCE_READ_FAILED' });
    assert.equal(f.calls.some(call => call.method === 'thread/read' && call.params.includeTurns), stage === 'legacy');
    assert.equal(f.calls.some(call => call.method === 'thread/turns/list'), stage !== 'items');
  }
});

test('timeouts retain their actionable category and do not attempt fallback', async () => {
  const f = fixture(() => { throw new AssistantError('CODEX_TIMEOUT'); });
  await assert.rejects(f.preview(), { code: 'CODEX_TIMEOUT' });
  assert.equal(f.calls.filter(call => call.method === 'thread/read').length, 1);
  assert.equal(f.calls.some(call => call.method === 'thread/turns/list'), false);
});

test('a failure after reading part of a snapshot never splices legacy text into it', async () => {
  const f = fixture((method, params) => {
    assert.equal(method, 'thread/items/list');
    if (params.cursor) return unsupported();
    return { data: [{ turnId: 'original-turn', item: user('newest') }], nextCursor: 'older-page' };
  });
  await assert.rejects(f.preview(), { code: 'SOURCE_READ_UNAVAILABLE' });
  assert.equal(f.calls.some(call => call.method === 'thread/turns/list'), false);
  assert.equal(f.calls.some(call => call.method === 'thread/read' && call.params.includeTurns), false);
});

test('legacy history rejects mismatched threads, malformed turns and summary-only content', async () => {
  const cases = [
    [{ ...metadata(), id: 'unselected-chat', turns: [] }, 'CODEX_PROTOCOL_ERROR'],
    [{ ...metadata() }, 'CODEX_PROTOCOL_ERROR'],
    [{ ...metadata(), turns: [turn('../invalid', [])] }, 'CODEX_PROTOCOL_ERROR'],
    [{ ...metadata(), turns: [{ id: 'turn', items: null }] }, 'CODEX_PROTOCOL_ERROR'],
    [{ ...metadata(), turns: [{ ...turn('turn', [user('summary')]), itemsView: 'summary' }] }, 'SOURCE_READ_UNAVAILABLE'],
  ];
  for (const [thread, code] of cases) {
    const f = fixture(method => method === 'thread/read' ? { thread } : unsupported());
    await assert.rejects(f.preview(), { code });
  }
});

test('full-turn fallback rejects summary views and repeated pagination cursors', async () => {
  for (const summary of [true, false]) {
    const f = fixture(method => {
      if (method === 'thread/items/list') return unsupported();
      assert.equal(method, 'thread/turns/list');
      return { data: [{ ...turn('turn', [user('report')]), ...(summary ? { itemsView: 'summary' } : {}) }], nextCursor: 'same-page' };
    });
    await assert.rejects(f.preview(), { code: summary ? 'SOURCE_READ_UNAVAILABLE' : 'CODEX_PROTOCOL_ERROR' });
  }
});

test('linked activity checks reject malformed latest-turn information instead of assuming it is safe to send', async () => {
  for (const latest of [{ status: 'completed' }, { id: 'turn', status: 'unknown' }, { id: 'turn' }]) {
    const f = fixture(method => {
      assert.equal(method, 'thread/turns/list');
      return { data: [latest], nextCursor: null };
    });
    await assert.rejects(readLinkedSnapshot(f.rpc, id), { code: 'CODEX_PROTOCOL_ERROR' });
    assert.equal(f.calls.some(call => call.method === 'thread/items/list'), false);
  }
  const f = legacyFixture([turn('older-turn', [user('old')]), { id: 'latest-turn', items: [user('new')], status: 'unknown' }]);
  await assert.rejects(readLinkedSnapshot(f.rpc, id), { code: 'CODEX_PROTOCOL_ERROR' });
});

test('modern history keeps its existing direct item path and does not request full-history fallback', async () => {
  const f = fixture(method => {
    assert.equal(method, 'thread/items/list');
    return { data: [{ turnId: 'turn', item: user('report'), startedAtMs: 1_700_000_000_000 }], nextCursor: null };
  });
  const history = await openCodexHistory(f.rpc, id);
  const first = await history.nextPage();
  assert.equal(first.data[0].item.clientId, 'client-report');
  assert.equal(first.data[0].startedAtMs, 1_700_000_000_000);
  assert.deepEqual(await history.nextPage(), { data: [], nextCursor: null });
  assert.deepEqual(f.calls.map(call => call.method), ['thread/read', 'thread/items/list']);
});
