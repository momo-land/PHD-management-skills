import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const COLLECTIONS = ['projects', 'papers', 'experiments', 'tasks', 'meetings', 'literature', 'reviews'];
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const COMMON = ['id', 'title', 'notes', 'origin', 'createdAt', 'updatedAt', 'version'];
const FIELDS = {
  projects: ['description', 'field', 'goal', 'status', 'targetDate'],
  papers: ['projectId', 'status', 'venue', 'dueDate', 'progress', 'sections', 'experimentIds', 'literatureIds'],
  experiments: ['projectId', 'paperId', 'status', 'hypothesis', 'method', 'metric', 'baseline', 'result', 'artifactPath', 'dueDate', 'evidence'],
  tasks: ['projectId', 'paperId', 'experimentId', 'meetingId', 'status', 'priority', 'dueDate', 'evidence'],
  meetings: ['projectId', 'date', 'attendees', 'summary', 'feedback', 'nextSteps'],
  literature: ['projectId', 'authors', 'year', 'url', 'doi', 'status', 'relevance', 'takeaway', 'evidence'],
  reviews: ['projectId', 'focus', 'assessment', 'recommendations', 'evidence'],
};
const STATUS = {
  projects: ['active', 'paused', 'completed'], papers: ['idea', 'outline', 'drafting', 'revising', 'submitted', 'accepted'],
  experiments: ['planned', 'running', 'completed', 'blocked'], tasks: ['todo', 'in_progress', 'done', 'blocked'], literature: ['to_read', 'reading', 'read'],
};
const ORIGINS = ['user', 'ai', 'import', 'demo'];
const LABELS = { projects: '科研项目', papers: '论文', experiments: '实验', tasks: '任务', meetings: '导师会议', literature: '文献', reviews: 'AI 研究建议' };
const STATUS_LABELS = { active: '进行中', paused: '暂停', completed: '已完成', idea: '构思', outline: '大纲', drafting: '写作中', revising: '修改中', submitted: '已投稿', accepted: '已接收', planned: '待开始', running: '进行中', blocked: '受阻', todo: '待办', in_progress: '进行中', done: '已完成', to_read: '待读', reading: '阅读中', read: '已读' };

export class StoreError extends Error {
  constructor(message, code = 'VALIDATION', status = 400) { super(message); this.name = 'StoreError'; this.code = code; this.status = status; }
}
export function validateLocale(locale = 'zh') {
  if (!['zh', 'en'].includes(locale)) throw new StoreError('语言必须为 zh 或 en。', 'INVALID_LOCALE');
  return locale;
}
const invalid = message => { throw new StoreError(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validVersion = value => Number.isSafeInteger(value) && value >= 1;
const dateValid = value => {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const isoTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && dateValid(value.slice(0, 10)) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
const key = (collection, id) => `${collection}:${id}`;

function checkCollection(collection) {
  if (!COLLECTIONS.includes(collection)) throw new StoreError('未知的数据类型。', 'NOT_FOUND', 404);
}
function checkFields(collection, value, mode) {
  if (!object(value)) invalid('记录必须是 JSON 对象。');
  const allowed = new Set([...COMMON, ...FIELDS[collection]]);
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) invalid(`不支持的字段：${field}。`);
    if (mode === 'create' && ['createdAt', 'updatedAt', 'version'].includes(field)) invalid(`${field} 由系统生成。`);
    if (mode === 'update' && ['id', 'createdAt', 'updatedAt'].includes(field)) invalid(`不能修改 ${field}。`);
  }
}
function defaults(collection) {
  const value = { notes: '', origin: collection === 'reviews' ? 'ai' : 'user' };
  for (const field of FIELDS[collection]) value[field] = '';
  if (STATUS[collection]) value.status = STATUS[collection][0];
  if (collection === 'papers') Object.assign(value, { progress: 0, sections: [], experimentIds: [], literatureIds: [] });
  if (collection === 'tasks') value.priority = 'medium';
  if (collection === 'literature') value.year = null;
  return value;
}
function validateRecord(collection, record) {
  checkFields(collection, record, 'import');
  if (!validId(record.id)) invalid('id 只能包含英文字母、数字、下划线和连字符，长度为 1–128。');
  if (typeof record.title !== 'string' || !record.title.trim() || record.title.length > 500) invalid('标题不能为空，且不能超过 500 个字符。');
  if (!ORIGINS.includes(record.origin)) invalid('origin 必须为 user、ai、import 或 demo。');
  if (!validVersion(record.version)) invalid('version 必须为正整数。');
  if (!isoTime(record.createdAt) || !isoTime(record.updatedAt)) invalid('记录时间必须是有效的 UTC ISO 时间。');
  if (STATUS[collection] && !STATUS[collection].includes(record.status)) invalid(`无效的状态；可选：${STATUS[collection].join('、')}。`);
  const arrays = new Set(['sections', 'experimentIds', 'literatureIds']);
  for (const field of ['notes', ...FIELDS[collection]]) {
    if (arrays.has(field) || ['year', 'progress'].includes(field)) continue;
    if (typeof record[field] !== 'string' || record[field].length > 200_000) invalid(`${field} 必须是文本，且不能超过 200000 个字符。`);
    if (['date', 'dueDate', 'targetDate'].includes(field) && !dateValid(record[field])) invalid(`${field} 必须是有效的 YYYY-MM-DD 日期或空字符串。`);
  }
  if (collection !== 'projects' && !validId(record.projectId)) invalid('请选择有效的科研项目（projectId）。');
  if (collection === 'papers') {
    if (!Number.isInteger(record.progress) || record.progress < 0 || record.progress > 100) invalid('论文自估进度必须是 0–100 的整数。');
    if (!Array.isArray(record.sections) || record.sections.length > 200) invalid('sections 必须为数组，最多 200 项。');
    for (const section of record.sections) {
      if (!object(section) || Object.keys(section).some(field => !['name', 'status'].includes(field)) || typeof section.name !== 'string' || !section.name.trim() || section.name.length > 500 || !['todo', 'drafting', 'done'].includes(section.status)) invalid('章节必须包含有效的 name 和 status（todo、drafting、done）。');
    }
    for (const field of ['experimentIds', 'literatureIds']) {
      if (!Array.isArray(record[field]) || record[field].length > 10000 || record[field].some(id => !validId(id)) || new Set(record[field]).size !== record[field].length) invalid(`${field} 必须为不重复的有效 ID 数组。`);
    }
  }
  if (collection === 'tasks' && !['high', 'medium', 'low'].includes(record.priority)) invalid('任务优先级必须为 high、medium 或 low。');
  if (collection === 'literature') {
    if (record.year !== null && (!Number.isInteger(record.year) || record.year < 1 || record.year > 9999)) invalid('文献年份必须为 1–9999 的整数或 null。');
    if (record.url) {
      let url; try { url = new URL(record.url); } catch { invalid('文献 URL 必须为有效的 http 或 https 地址。'); }
      if (!['http:', 'https:'].includes(url.protocol)) invalid('文献 URL 仅支持 http 和 https。');
    }
  }
  if (collection === 'experiments' && record.status === 'completed' && (!record.result.trim() || !record.evidence.trim())) invalid('完成实验必须填写结果（result）和证据（evidence）。');
}
function references(collection, record) {
  const refs = [];
  if (collection !== 'projects') refs.push(['projects', record.projectId]);
  for (const [field, target] of [['paperId', 'papers'], ['experimentId', 'experiments'], ['meetingId', 'meetings']]) if (record[field]) refs.push([target, record[field]]);
  for (const [field, target] of [['experimentIds', 'experiments'], ['literatureIds', 'literature']]) for (const id of record[field] || []) refs.push([target, id]);
  return refs;
}
function validateReferences(records) {
  for (const [collection, entries] of Object.entries(records)) for (const record of entries.values()) {
    for (const [targetCollection, id] of references(collection, record)) {
      const target = records[targetCollection].get(id);
      if (!target) invalid(`“${record.title}” 引用了不存在的${LABELS[targetCollection]}：${id}。`);
      if (targetCollection !== 'projects' && target.projectId !== record.projectId) invalid(`“${record.title}” 的关联记录必须属于同一个科研项目。`);
    }
  }
}
const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([field, entry]) => [field, canonical(entry)])) : value;
const comparable = record => {
  const { version, updatedAt, ...content } = record;
  return JSON.stringify(canonical(content));
};
function localDay(date = new Date(), timeZone = 'Asia/Shanghai') {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function markdownText(value) { return String(value || '').replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}\[\]<>|#]/g, '\\$&'); }

export function createStore({ dataDir = process.env.PHD_DATA_DIR || resolve(ROOT, 'data'), demo = false, timeZone = process.env.PHD_TIMEZONE || 'Asia/Shanghai' } = {}) {
  try { new Intl.DateTimeFormat('en-CA', { timeZone }).format(); }
  catch { invalid('PHD_TIMEZONE 必须为有效的时区名称，例如 Asia/Shanghai。'); }
  const directory = resolve(dataDir);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(resolve(directory, 'research.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
  db.exec(`CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(collection,id));
    CREATE TABLE IF NOT EXISTS activity (seq INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);`);
  const getMeta = db.prepare('SELECT value FROM metadata WHERE key = ?');
  const setMeta = db.prepare('INSERT INTO metadata (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  const getRow = db.prepare('SELECT data FROM records WHERE collection = ? AND id = ?');
  const putRow = db.prepare('INSERT INTO records (collection,id,data) VALUES (?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data');
  const deleteRow = db.prepare('DELETE FROM records WHERE collection = ? AND id = ?');
  const writeAudit = db.prepare('INSERT INTO activity(data) VALUES (?)');
  let closed = false;
  let transactionDepth = 0;
  function transaction(fn, { rollback = false } = {}) {
    if (closed) throw new StoreError('数据库已关闭。', 'CLOSED', 500);
    if (transactionDepth) {
      if (rollback) throw new StoreError('不能在已有事务中嵌套批量预览。');
      return fn();
    }
    db.exec('BEGIN IMMEDIATE');
    transactionDepth++;
    try { const result = fn(); db.exec(rollback ? 'ROLLBACK' : 'COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
    finally { transactionDepth--; }
  }
  function readAll() {
    const records = Object.fromEntries(COLLECTIONS.map(collection => [collection, new Map()]));
    for (const row of db.prepare('SELECT collection,id,data FROM records ORDER BY rowid').all()) records[row.collection].set(row.id, JSON.parse(row.data));
    return records;
  }
  function recordAt(collection, id) {
    checkCollection(collection);
    const row = getRow.get(collection, id);
    if (!row) throw new StoreError('记录不存在，可能已经被删除。', 'NOT_FOUND', 404);
    return JSON.parse(row.data);
  }
  function assertVersion(record, version) {
    if (!validVersion(version)) invalid('请提供当前记录的 version 正整数。');
    if (record.version !== version) throw new StoreError('记录已被其他操作更新，请刷新后重试。', 'VERSION_CONFLICT', 409);
  }
  function audit(action, collection, record) {
    const at = new Date().toISOString();
    writeAudit.run(JSON.stringify({ id: randomUUID(), at, action, collection, recordId: record.id, title: record.title, origin: record.origin }));
    setMeta.run('updatedAt', at);
  }
  function save(collection, record, action) { putRow.run(collection, record.id, JSON.stringify(record)); audit(action, collection, record); }
  function state() {
    // A read transaction keeps metadata, records and audit consistent across CLI/server writers.
    return transaction(() => {
      const all = readAll();
      return { schemaVersion: 1, updatedAt: getMeta.get('updatedAt').value, ...Object.fromEntries(COLLECTIONS.map(collection => [collection, [...all[collection].values()]])), activity: db.prepare('SELECT data FROM activity ORDER BY seq DESC').all().map(row => JSON.parse(row.data)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)) };
    });
  }
  function create(collection, data) {
    checkCollection(collection); checkFields(collection, data, 'create');
    return transaction(() => {
      const now = new Date().toISOString();
      const record = { ...defaults(collection), ...data, id: data.id ?? randomUUID(), createdAt: now, updatedAt: now, version: 1 };
      validateRecord(collection, record);
      if (getRow.get(collection, record.id)) throw new StoreError('该 ID 的记录已存在。', 'DUPLICATE_ID', 409);
      const all = readAll(); all[collection].set(record.id, record); validateReferences(all);
      save(collection, record, 'create');
      return record;
    });
  }
  function update(collection, id, patch) {
    checkCollection(collection); checkFields(collection, patch, 'update');
    return transaction(() => {
      const current = recordAt(collection, id); assertVersion(current, patch.version);
      const record = { ...current, ...patch, version: current.version + 1, updatedAt: new Date().toISOString() };
      validateRecord(collection, record);
      const all = readAll(); all[collection].set(id, record); validateReferences(all);
      save(collection, record, 'update'); return record;
    });
  }
  function batch(payload, options = {}) {
    if (!object(payload) || Object.keys(payload).some(field => field !== 'operations')) invalid('批量请求仅接受 {operations: 操作数组}。');
    if (!Array.isArray(payload.operations) || payload.operations.length < 1 || payload.operations.length > 100) invalid('operations 必须为包含 1–100 项的数组。');
    if (!object(options) || Object.keys(options).some(field => field !== 'dryRun') || (options.dryRun !== undefined && typeof options.dryRun !== 'boolean')) invalid('批量选项仅接受布尔值 dryRun。');
    const dryRun = options.dryRun ?? false;
    return transaction(() => {
      const results = Array.from(payload.operations, (operation, offset) => {
        try {
          if (!object(operation) || !['create', 'update'].includes(operation.action)) invalid('每项操作的 action 必须为 create 或 update；批量操作不支持删除。');
          const allowed = operation.action === 'create' ? ['action', 'collection', 'data'] : ['action', 'collection', 'id', 'data'];
          if (Object.keys(operation).some(field => !allowed.includes(field))) invalid('操作包含未知字段；新建记录的显式 ID 应填写在 data.id。');
          if (operation.action === 'update' && !validId(operation.id)) invalid('更新操作必须提供有效的记录 id。');
          const record = operation.action === 'create' ? create(operation.collection, operation.data) : update(operation.collection, operation.id, operation.data);
          return { index: offset + 1, action: operation.action, collection: operation.collection, record };
        } catch (error) {
          if (error instanceof StoreError) throw new StoreError(`第 ${offset + 1} 项操作失败，整批未写入：${error.message}`, error.code, error.status);
          throw error;
        }
      });
      return { ok: true, dryRun, applied: dryRun ? 0 : results.length, results };
    }, { rollback: dryRun });
  }
  function checkDependents(all, targets) {
    for (const collection of COLLECTIONS) for (const record of all[collection].values()) {
      if (targets.has(key(collection, record.id))) continue;
      if (references(collection, record).some(([target, id]) => targets.has(key(target, id)))) throw new StoreError(`“${record.title}” 仍引用待删除记录，请先解除关联或删除依赖记录。`, 'DEPENDENCY_CONFLICT', 409);
    }
  }
  function remove(collection, id, version) {
    checkCollection(collection);
    return transaction(() => {
      const record = recordAt(collection, id); assertVersion(record, version);
      checkDependents(readAll(), new Set([key(collection, id)]));
      deleteRow.run(collection, id); audit('delete', collection, record); return { ok: true };
    });
  }
  function importSnapshot(snapshot) {
    if (!object(snapshot) || snapshot.schemaVersion !== 1) invalid('导入文件必须使用 schemaVersion: 1。');
    const allowed = new Set(['schemaVersion', 'updatedAt', 'activity', ...COLLECTIONS]);
    for (const field of Object.keys(snapshot)) if (!allowed.has(field)) invalid(`不支持的快照字段：${field}。`);
    if (snapshot.updatedAt !== undefined && !isoTime(snapshot.updatedAt)) invalid('快照 updatedAt 无效。');
    if (snapshot.activity !== undefined) {
      if (!Array.isArray(snapshot.activity)) invalid('activity 必须为数组。');
      for (const entry of snapshot.activity) {
        if (!object(entry) || Object.keys(entry).some(field => !['id', 'at', 'action', 'collection', 'recordId', 'title', 'origin'].includes(field)) || !validId(entry.id) || !isoTime(entry.at) || !['create', 'update', 'delete', 'import', 'clear-demo'].includes(entry.action) || !COLLECTIONS.includes(entry.collection) || !validId(entry.recordId) || typeof entry.title !== 'string' || !ORIGINS.includes(entry.origin)) invalid('导入文件包含无效的 activity 元数据。');
      }
    }
    return transaction(() => {
      const all = readAll(); const changes = []; let imported = 0;
      const knownActivity = new Map(db.prepare('SELECT data FROM activity').all().map(row => { const entry = JSON.parse(row.data); return [entry.id, entry]; }));
      const newActivity = [];
      for (const entry of snapshot.activity || []) {
        const known = knownActivity.get(entry.id);
        if (known && JSON.stringify(canonical(known)) !== JSON.stringify(canonical(entry))) throw new StoreError('导入的活动历史与已有的同 ID 记录冲突，未修改任何数据。', 'AUDIT_CONFLICT', 409);
        if (!known) { knownActivity.set(entry.id, entry); newActivity.push(entry); }
      }
      for (const collection of COLLECTIONS) {
        const entries = snapshot[collection] ?? [];
        if (!Array.isArray(entries)) invalid(`${collection} 必须为数组。`);
        const seen = new Set();
        for (const entry of entries) {
          checkFields(collection, entry, 'import');
          if (!validId(entry.id)) invalid(`导入的${LABELS[collection]}必须包含有效 id。`);
          if (seen.has(entry.id)) invalid(`${collection} 中包含重复 ID：${entry.id}。`);
          seen.add(entry.id);
          const now = new Date().toISOString();
          const current = all[collection].get(entry.id);
          const record = { ...defaults(collection), ...entry, createdAt: entry.createdAt ?? current?.createdAt ?? now, updatedAt: entry.updatedAt ?? now, version: entry.version ?? 1 };
          validateRecord(collection, record);
          imported++;
          if (current && comparable(current) === comparable(record)) continue;
          if (current) {
            assertVersion(current, entry.version);
            if (record.createdAt !== current.createdAt) invalid('已有记录的 createdAt 不能改变。');
            record.version = current.version + 1;
            record.updatedAt = now;
          }
          all[collection].set(record.id, record); changes.push([collection, record]);
        }
      }
      validateReferences(all);
      for (const entry of newActivity) writeAudit.run(JSON.stringify(entry));
      if (newActivity.length) setMeta.run('updatedAt', new Date().toISOString());
      for (const [collection, record] of changes) save(collection, record, 'import');
      return { ok: true, imported };
    });
  }
  function clearDemo() {
    return transaction(() => {
      const all = readAll(); const targets = new Set(); const records = [];
      for (const collection of COLLECTIONS) for (const record of all[collection].values()) if (record.origin === 'demo') { targets.add(key(collection, record.id)); records.push([collection, record]); }
      checkDependents(all, targets);
      for (const [collection, record] of records) { deleteRow.run(collection, record.id); audit('clear-demo', collection, record); }
      return { removed: records.length };
    });
  }
  function clearDemoHistory() {
    return transaction(() => {
      const targets = db.prepare('SELECT seq,data FROM activity').all().filter(row => {
        const entry = JSON.parse(row.data);
        return entry.origin === 'demo' && !getRow.get(entry.collection, entry.recordId);
      });
      if (targets.length) {
        const deleteActivity = db.prepare('DELETE FROM activity WHERE seq = ?');
        for (const { seq } of targets) deleteActivity.run(seq);
        const previous = Date.parse(getMeta.get('updatedAt').value);
        setMeta.run('updatedAt', new Date(Math.max(Date.now(), previous + 1)).toISOString());
      }
      return { removed: targets.length };
    });
  }
  function report(projectId, locale = 'zh') {
    validateLocale(locale);
    const snapshot = state();
    if (projectId && !snapshot.projects.some(project => project.id === projectId)) throw new StoreError('科研项目不存在。', 'NOT_FOUND', 404);
    const now = new Date(); const today = localDay(now, timeZone); const begin = new Date(`${today}T12:00:00.000Z`); begin.setUTCDate(begin.getUTCDate() - 6); const start = begin.toISOString().slice(0, 10);
    const relevant = collection => snapshot[collection].filter(record => !projectId || (collection === 'projects' ? record.id === projectId : record.projectId === projectId));
    const records = Object.fromEntries(COLLECTIONS.map(collection => [collection, relevant(collection)]));
    const scopedIds = new Set(COLLECTIONS.flatMap(collection => records[collection].map(record => key(collection, record.id))));
    const activity = snapshot.activity.filter(entry => { const day = localDay(new Date(entry.at), timeZone); return day >= start && day <= today && (!projectId || scopedIds.has(key(entry.collection, entry.recordId))); });
    if (locale === 'en') {
      const labels = { projects: 'Project', papers: 'Paper', experiments: 'Experiment', tasks: 'Task', meetings: 'Supervisor meeting', literature: 'Literature', reviews: 'AI research advice' };
      const statuses = { active: 'Active', paused: 'Paused', completed: 'Completed', idea: 'Idea', outline: 'Outline', drafting: 'Drafting', revising: 'Revising', submitted: 'Submitted', accepted: 'Accepted', planned: 'Planned', running: 'Running', blocked: 'Blocked', todo: 'To do', in_progress: 'In progress', done: 'Done', to_read: 'To read', reading: 'Reading', read: 'Read' };
      const actions = { create: 'Created', update: 'Updated', delete: 'Deleted', import: 'Imported', 'clear-demo': 'Cleared demo' };
      const lines = ['# Weekly Research Progress Report', '', `Reporting period: ${start} to ${today} (last seven calendar days, ${timeZone})`, `Generated at: ${now.toISOString()}`, `Scope: ${projectId ? markdownText(records.projects[0].title) : 'All projects'}`, '', '## Changes recorded during this period', ''];
      if (!activity.length) lines.push('No changes were recorded during this period.');
      else for (const entry of activity) lines.push(`- ${localDay(new Date(entry.at), timeZone)}: ${actions[entry.action] || entry.action} ${labels[entry.collection]} “${markdownText(entry.title)}”${entry.origin === 'demo' ? ' (demo)' : ''}.`);
      if (projectId) lines.push('', 'Note: This project report includes changes only for records that can still be linked to this project. See the global activity log for the full history of deleted records.');
      lines.push('', '## Current state snapshot (not limited to this period)', '', `Projects ${records.projects.length} · Papers ${records.papers.length} · Experiments ${records.experiments.length} · Tasks ${records.tasks.length} · Literature ${records.literature.length}`, '');
      for (const paper of records.papers) lines.push(`- Paper “${markdownText(paper.title)}”: ${statuses[paper.status]}; recorded progress ${paper.progress}%${paper.progress === 0 ? ' (defaults to 0% when no estimate has been entered)' : ''}.`);
      for (const experiment of records.experiments) {
        lines.push(`- Experiment “${markdownText(experiment.title)}”: ${statuses[experiment.status]}.`);
        if (experiment.status === 'completed') lines.push(`  - Recorded result: ${markdownText(experiment.result)}; evidence: ${markdownText(experiment.evidence)}.`);
      }
      const openTasks = records.tasks.filter(record => record.status !== 'done');
      lines.push('', '## Current open tasks and deadlines', '');
      if (!openTasks.length) lines.push('There are currently no unfinished tasks.');
      for (const task of openTasks) lines.push(`- [ ] ${markdownText(task.title)} (${statuses[task.status]}${task.dueDate ? `; due ${task.dueDate}${task.dueDate < today ? ', overdue' : ''}` : '; no deadline set'})${task.evidence ? `; record: ${markdownText(task.evidence)}` : ''}`);
      for (const collection of ['projects', 'papers', 'experiments']) for (const record of records[collection]) {
        const due = record.dueDate || record.targetDate;
        if (due && !['completed', 'accepted'].includes(record.status)) lines.push(`- ${labels[collection]} “${markdownText(record.title)}”: ${due}${due < today ? ' (overdue)' : ''}.`);
      }
      lines.push('', '## Supervisor meeting records', '');
      const meetings = records.meetings.filter(record => record.date >= start && record.date <= today);
      if (!meetings.length) lines.push('No actual supervisor meetings were recorded for this period.');
      for (const meeting of meetings) lines.push(`- ${meeting.date} “${markdownText(meeting.title)}”; feedback: ${markdownText(meeting.feedback) || 'Not entered'}; next steps: ${markdownText(meeting.nextSteps) || 'Not entered'}.`);
      lines.push('', '## AI research advice (current records)', '');
      if (!records.reviews.length) lines.push('There are currently no AI research advice records.');
      for (const review of records.reviews) lines.push(`- “${markdownText(review.title)}”: ${markdownText(review.recommendations) || 'No recommendations entered'}.`);
      lines.push('', 'This report is a deterministic summary of local records. AI research advice does not represent supervisor feedback. Experiment results reflect only the information recorded, and demo data does not represent real research work.', '');
      return { markdown: lines.join('\n'), generatedAt: now.toISOString() };
    }
    const lines = [`# 科研进展周报`, '', `报告周期：${start} 至 ${today}（最近七个日历日，${timeZone}）`, `生成时间：${now.toISOString()}`, `范围：${projectId ? markdownText(records.projects[0].title) : '全部项目'}`, '', '## 周期内已记录的变更', ''];
    const actions = { create: '新增', update: '更新', delete: '删除', import: '导入', 'clear-demo': '清除示例' };
    if (!activity.length) lines.push('本周期没有已记录的变更。');
    else for (const entry of activity) lines.push(`- ${localDay(new Date(entry.at), timeZone)}：${actions[entry.action] || entry.action}${LABELS[entry.collection]}「${markdownText(entry.title)}」${entry.origin === 'demo' ? '（示例）' : ''}。`);
    if (projectId) lines.push('', '注：项目报告仅包含当前仍可关联到该项目的记录变更；删除记录的完整历史见全局活动日志。');
    lines.push('', '## 当前状态快照（不限于本周期）', '', `项目 ${records.projects.length} · 论文 ${records.papers.length} · 实验 ${records.experiments.length} · 任务 ${records.tasks.length} · 文献 ${records.literature.length}`, '');
    for (const paper of records.papers) lines.push(`- 论文「${markdownText(paper.title)}」：${STATUS_LABELS[paper.status]}；登记进度 ${paper.progress}%${paper.progress === 0 ? '（未填写时默认从 0% 开始）' : ''}。`);
    for (const experiment of records.experiments) {
      lines.push(`- 实验「${markdownText(experiment.title)}」：${STATUS_LABELS[experiment.status]}。`);
      if (experiment.status === 'completed') lines.push(`  - 已登记结果：${markdownText(experiment.result)}；证据：${markdownText(experiment.evidence)}。`);
    }
    const openTasks = records.tasks.filter(record => record.status !== 'done');
    lines.push('', '## 当前待办与截止日期', '');
    if (!openTasks.length) lines.push('当前没有未完成任务。');
    for (const task of openTasks) lines.push(`- [ ] ${markdownText(task.title)}（${STATUS_LABELS[task.status]}${task.dueDate ? `；截止 ${task.dueDate}${task.dueDate < today ? '，已逾期' : ''}` : '；未设置截止日期'}）${task.evidence ? `；记录：${markdownText(task.evidence)}` : ''}`);
    for (const collection of ['projects', 'papers', 'experiments']) for (const record of records[collection]) {
      const due = record.dueDate || record.targetDate;
      if (due && !['completed', 'accepted'].includes(record.status)) lines.push(`- ${LABELS[collection]}「${markdownText(record.title)}」：${due}${due < today ? '（已逾期）' : ''}。`);
    }
    lines.push('', '## 导师会议记录', '');
    const meetings = records.meetings.filter(record => record.date >= start && record.date <= today);
    if (!meetings.length) lines.push('本周期没有登记实际导师会议。');
    for (const meeting of meetings) lines.push(`- ${meeting.date}「${markdownText(meeting.title)}」；反馈：${markdownText(meeting.feedback) || '未填写'}；下一步：${markdownText(meeting.nextSteps) || '未填写'}。`);
    lines.push('', '## AI 研究建议（当前记录）', '');
    if (!records.reviews.length) lines.push('当前没有 AI 研究建议记录。');
    for (const review of records.reviews) lines.push(`- 「${markdownText(review.title)}」：${markdownText(review.recommendations) || '未填写建议'}。`);
    lines.push('', '以上内容由本地记录确定性汇总；AI 研究建议不代表导师意见，实验结果仅反映已登记的内容，示例数据不代表真实科研工作。', '');
    return { markdown: lines.join('\n'), generatedAt: now.toISOString() };
  }
  function close() { if (!closed) { db.close(); closed = true; } }
  try {
    transaction(() => {
      if (getMeta.get('initialized')) {
        if (getMeta.get('schemaVersion')?.value !== '1') throw new StoreError('数据库版本不受支持，请先备份。', 'SCHEMA_VERSION', 500);
        return;
      }
      setMeta.run('initialized', '1'); setMeta.run('schemaVersion', '1'); setMeta.run('updatedAt', new Date().toISOString());
      if (demo) importSnapshot(JSON.parse(readFileSync(resolve(ROOT, 'fixtures/demo.json'), 'utf8')));
    });
  } catch (error) { close(); throw error; }
  return { state, create, update, batch, remove, importSnapshot, clearDemo, clearDemoHistory, report, close };
}
