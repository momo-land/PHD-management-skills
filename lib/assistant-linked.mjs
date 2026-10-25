import { AssistantError } from './assistant-bridge.mjs';
import { SOURCE_LIMITS } from './assistant-sources.mjs';
import { createHash } from 'node:crypto';

const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const fail = () => { throw new AssistantError('CODEX_PROTOCOL_ERROR'); };
const date = value => typeof value === 'number' && Number.isFinite(value) && Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : null;
const digest = value => createHash('sha256').update(value).digest('hex');

// Reads the persisted display text only. Never loads a model, resumes a thread,
// reads history files directly, or executes an item from the original chat.
export async function readLinkedSnapshot(rpc, threadId) {
  const read = await rpc.request('thread/read', { threadId, includeTurns: false });
  if (read?.thread?.id !== threadId) fail();
  const latest = await rpc.request('thread/turns/list', { threadId, limit: 1, sortDirection: 'desc' });
  if (!Array.isArray(latest?.data) || latest.data.length > 1) fail();
  const source = { threadId, title: String(read.thread.name || read.thread.preview || threadId).slice(0, 200), cwd: typeof read.thread.cwd === 'string' ? read.thread.cwd.slice(0, 4096) : '', truncated: false, externalRunning: read.thread.status?.type === 'active' || latest.data.some(turn => turn.status === 'inProgress') };
  let cursor; let count = 0; let budget = SOURCE_LIMITS.maxTextChars; let complete = true;
  const seen = new Set(); const cursors = new Set(); const messages = [];
  do {
    const page = await rpc.request('thread/items/list', { threadId, limit: 10, sortDirection: 'desc', ...(cursor ? { cursor } : {}) });
    if (!Array.isArray(page?.data) || page.data.length > 10 || (page.nextCursor != null && typeof page.nextCursor !== 'string')) fail();
    for (const entry of page.data) {
      count++;
      const item = entry?.item;
      if (!item || !['userMessage', 'agentMessage'].includes(item.type)) continue;
      if (!validId(item.id) || !validId(entry.turnId)) { source.truncated = true; complete = false; continue; }
      const key = `${entry.turnId}:${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const content = item.type === 'userMessage' ? (Array.isArray(item.content) ? item.content.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text).join('\n') : '') : (typeof item.text === 'string' ? item.text : '');
      if (!content.trim()) continue;
      const text = content.slice(0, Math.min(SOURCE_LIMITS.maxMessageChars, budget));
      budget -= text.length;
      if (text.length < content.length) source.truncated = true;
      if (text) messages.push({ id: key, sourceItemId: item.id, turnId: entry.turnId, ...(validId(item.clientId) ? { clientId: item.clientId } : {}), role: item.type === 'userMessage' ? 'user' : 'assistant', text, sha256: digest(content), truncated: text.length < content.length, at: date(entry.completedAtMs) || date(entry.startedAtMs) });
      else complete = false;
    }
    cursor = page.nextCursor || null;
    if (cursor && cursors.has(cursor)) fail();
    if (cursor) cursors.add(cursor);
    if (cursor && (count >= SOURCE_LIMITS.maxItemsPerThread || cursors.size >= 20 || budget <= 0)) { source.truncated = true; complete = false; break; }
  } while (cursor);
  return { source, messages: messages.reverse(), complete };
}

export function mergeLinkedMessages(existing, incoming, { complete = false } = {}) {
  const matches = (old, item) => old.id === item.id || (old.sourceItemId && old.sourceItemId === item.sourceItemId && old.turnId === item.turnId) || (item.clientId && old.clientId === item.clientId) || (old.id === item.sourceItemId && (!old.turnId || old.turnId === item.turnId));
  const fromSource = existing.filter(item => item.sourceItemId);
  const anchor = complete ? -1 : fromSource.findIndex(old => incoming.some(item => matches(old, item)));
  // A recent window is authoritative from its first known anchor through the
  // end, including deletions/rollbacks. With no overlap, show just that window
  // instead of retaining unverifiable cached messages from a possible rollback.
  const prefix = anchor > 0 ? fromSource.slice(0, anchor) : [];
  const window = incoming.map(item => {
    const old = existing.find(value => matches(value, item));
    if (!old) return item;
    const keepFullText = item.truncated && old.text.length > item.text.length && item.sha256 === digest(old.text);
    return { ...old, ...item, text: keepFullText ? old.text : item.text, at: item.at || old.at };
  });
  // Failed/unconfirmed submissions belong to the local website, not to Codex's
  // authoritative history. Retain them without claiming they were submitted.
  const unconfirmed = existing.filter(old => !old.sourceItemId && !incoming.some(item => matches(old, item)));
  return [...prefix, ...window, ...unconfirmed];
}

export function previewLinkedMessages(entry) {
  return entry.material[0].messages.map(item => ({ id: `${item.turnId}:${item.id}`, sourceItemId: item.id, turnId: item.turnId, role: item.role, text: item.text, at: item.completedAt || item.startedAt }));
}
