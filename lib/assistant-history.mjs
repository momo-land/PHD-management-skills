import { AssistantError } from './assistant-bridge.mjs';

export const HISTORY_PAGE_SIZE = 10;
const protocolError = () => { throw new AssistantError('CODEX_PROTOCOL_ERROR'); };
const unsupported = error => error?.code === 'CODEX_METHOD_UNSUPPORTED';
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);

function readError(error) {
  if (unsupported(error)) throw new AssistantError('SOURCE_READ_UNAVAILABLE');
  if (error?.code === 'CODEX_REQUEST_FAILED') throw new AssistantError('SOURCE_READ_FAILED');
  throw error;
}
function validatePage(page, limit) {
  if (!Array.isArray(page?.data) || page.data.length > limit || (page.nextCursor != null && typeof page.nextCursor !== 'string')) protocolError();
}
function validateTurn(turn) {
  if (!validId(turn?.id) || !Array.isArray(turn.items)) protocolError();
  // A summary is not the original message. Never silently import shortened data.
  if (turn.itemsView != null && turn.itemsView !== 'full') throw new AssistantError('SOURCE_READ_UNAVAILABLE');
}
function validateActivity(turn) {
  if (!validId(turn?.id) || !['completed', 'interrupted', 'failed', 'inProgress'].includes(turn.status)) protocolError();
}

// Capability negotiation is per conversation: a modern Codex binary can still
// have legacy threads. All fallbacks are public read APIs, without a writer.
// Callers bound iteration and text; the transport bounds each RPC to 8 MiB.
export async function openCodexHistory(rpc, threadId, { checkActive = false } = {}) {
  let read;
  try { read = await rpc.request('thread/read', { threadId, includeTurns: false }); }
  catch (error) { readError(error); }
  if (read?.thread?.id !== threadId) protocolError();
  const history = { thread: read.thread, externalRunning: read.thread.status?.type === 'active', nextPage };
  let mode = 'items'; let cursor; let pages = 0; let finished = false;
  let pending = []; let pendingIndex = 0; let pendingTurnId; let legacyTurns; let legacyIndex = -1;
  const cursors = new Set();

  async function loadLegacy() {
    let result;
    try { result = await rpc.request('thread/read', { threadId, includeTurns: true }); }
    catch (error) { readError(error); }
    if (result?.thread?.id !== threadId || !Array.isArray(result.thread.turns)) protocolError();
    legacyTurns = result.thread.turns;
    // Validate even older turns before treating the window as authoritative.
    for (const turn of legacyTurns) { validateTurn(turn); if (checkActive) validateActivity(turn); }
    history.thread = result.thread;
    history.externalRunning ||= result.thread.status?.type === 'active' || legacyTurns.some(turn => turn.status === 'inProgress');
    legacyIndex = legacyTurns.length - 1;
    mode = 'legacy'; cursor = undefined; cursors.clear();
  }
  if (checkActive) {
    try {
      const latest = await rpc.request('thread/turns/list', { threadId, limit: 1, sortDirection: 'desc' });
      validatePage(latest, 1);
      latest.data.forEach(validateActivity);
      history.externalRunning ||= latest.data.some(turn => turn.status === 'inProgress');
    } catch (error) {
      if (!unsupported(error)) readError(error);
      // An unloaded thread's metadata alone cannot tell us another client's
      // turn is running. Read legacy turns before permitting a linked send.
      await loadLegacy();
    }
  }
  function advanceCursor(value) {
    cursor = value || null;
    if (cursor && cursors.has(cursor)) protocolError();
    if (cursor) cursors.add(cursor);
  }
  function takeTurn(turn) {
    validateTurn(turn);
    if (checkActive) validateActivity(turn);
    history.externalRunning ||= turn.status === 'inProgress';
    // Turn items are oldest-first. Per-message timestamps aren't supplied by
    // this API; don't substitute the turn's dates or the chat's updatedAt.
    pending = turn.items; pendingIndex = pending.length;
  }
  async function nextPage() {
    if (finished) return { data: [], nextCursor: null };
    if (mode === 'items') {
      let page;
      try {
        page = await rpc.request('thread/items/list', { threadId, limit: HISTORY_PAGE_SIZE, sortDirection: 'desc', ...(cursor ? { cursor } : {}) });
      } catch (error) {
        // Never splice a second snapshot into a partially read first one.
        if (!unsupported(error) || pages) readError(error);
        mode = 'turns';
      }
      if (page) {
        validatePage(page, HISTORY_PAGE_SIZE); advanceCursor(page.nextCursor); pages++;
        finished = !cursor;
        return { data: page.data, nextCursor: cursor };
      }
      if (mode === 'items') protocolError();
    }
    let turn;
    if (mode === 'turns' && pendingIndex === 0) {
      let page;
      try {
        page = await rpc.request('thread/turns/list', { threadId, limit: 1, sortDirection: 'desc', itemsView: 'full', ...(cursor ? { cursor } : {}) });
      } catch (error) {
        if (!unsupported(error) || pages) readError(error);
        await loadLegacy();
      }
      if (page) {
        validatePage(page, 1); advanceCursor(page.nextCursor);
        turn = page.data[0];
        if (turn) takeTurn(turn);
      } else if (mode === 'turns') protocolError();
    }
    if (mode === 'legacy' && pendingIndex === 0 && legacyIndex >= 0) {
      turn = legacyTurns[legacyIndex--]; takeTurn(turn);
    }
    // Keep the turn ID across chunks when one turn has many items.
    if (turn) pendingTurnId = turn.id;
    const data = [];
    while (pendingIndex > 0 && data.length < HISTORY_PAGE_SIZE) data.push({ turnId: pendingTurnId, item: pending[--pendingIndex] });
    pages++;
    const more = pendingIndex > 0 || (mode === 'legacy' ? legacyIndex >= 0 : !!cursor);
    finished = !more;
    return { data, nextCursor: more ? `history-page-${pages}` : null };
  }
  return history;
}
