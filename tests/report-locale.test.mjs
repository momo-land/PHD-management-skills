import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createStore, StoreError } from '../lib/store.mjs';
import { localizeError, requestLocale } from '../lib/error-locale.mjs';
import { startServer } from '../server.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
function workspace(t) {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-report-locale-'));
  const store = createStore({ dataDir, timeZone: 'Asia/Shanghai' });
  t.after(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); });
  return { dataDir, store };
}
async function httpWorkspace(t) {
  let server;
  t.after(async () => { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } });
  const { dataDir, store } = workspace(t);
  server = await startServer({ dataDir, demo: false, port: 0 });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, { method = 'GET', data, language, headers = {} } = {}) => {
    const response = await fetch(`${base}${path}`, { method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(language ? { 'Accept-Language': language } : {}), ...headers }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  return { store, request };
}

test('周报默认中文，空白英文周报完整本地化，未知语言严格拒绝且不改状态', t => {
  const { store } = workspace(t);
  const before = store.state();
  assert.match(store.report().markdown, /^# 科研进展周报/);
  const report = store.report(undefined, 'en');
  assert.match(report.markdown, /^# Weekly Research Progress Report/);
  for (const heading of ['Reporting period:', 'last seven calendar days, Asia/Shanghai', 'Scope: All projects', 'Changes recorded during this period', 'Current state snapshot (not limited to this period)', 'Current open tasks and deadlines', 'Supervisor meeting records', 'AI research advice (current records)']) assert.ok(report.markdown.includes(heading), heading);
  assert.doesNotMatch(report.markdown, /[\u3400-\u9fff]/);
  assert.ok(Number.isFinite(Date.parse(report.generatedAt)));
  for (const locale of ['', null, 'EN', 'en-US', 'fr', 1, {}]) assert.throws(() => store.report(undefined, locale), { code: 'INVALID_LOCALE', status: 400 });
  assert.deepEqual(store.state(), before);
});

test('英文周报翻译状态与系统描述，保留科研标题、结果、证据和导师原话', t => {
  const { store } = workspace(t);
  const project = store.create('projects', { title: '检索计划 α', targetDate: '2000-01-01' });
  store.create('papers', { projectId: project.id, title: '跨模态检索论文', status: 'drafting', progress: 60, dueDate: '2000-01-02', notes: '原始备注不应被语言选项改写。' });
  store.create('papers', { projectId: project.id, title: '尚未估计的论文', status: 'outline' });
  store.create('experiments', { projectId: project.id, title: '消融实验甲', status: 'completed', result: '观测结果：未见预期改善', evidence: '本地记录/测量.json' });
  store.create('experiments', { projectId: project.id, title: '消融实验乙', status: 'planned', dueDate: '2000-01-03' });
  store.create('tasks', { projectId: project.id, title: '等待数据到齐', status: 'blocked', dueDate: '2000-01-04', evidence: '用户确认尚未下载完成' });
  store.create('tasks', { projectId: project.id, title: '补充方案', status: 'todo' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  store.create('meetings', { projectId: project.id, title: '导师讨论', date: today, feedback: '请保留负结果。', nextSteps: '明确下一轮对照条件。' });
  store.create('reviews', { projectId: project.id, title: '研究建议', recommendations: '先复核数据划分。' });
  const before = store.state();
  const { markdown } = store.report(project.id, 'en');
  for (const original of ['检索计划 α', '跨模态检索论文', '消融实验甲', '观测结果：未见预期改善', '本地记录/测量.json', '用户确认尚未下载完成', '请保留负结果。', '明确下一轮对照条件。', '先复核数据划分。']) assert.ok(markdown.includes(original), original);
  for (const translated of ['Drafting; recorded progress 60%', 'defaults to 0% when no estimate has been entered', 'Completed.', 'Planned.', 'Blocked; due 2000-01-04, overdue', 'To do; no deadline set', 'Recorded result:', 'evidence:', 'feedback:', 'next steps:', 'Created Paper', 'full history of deleted records']) assert.ok(markdown.includes(translated), translated);
  assert.doesNotMatch(markdown, /科研进展周报|报告周期|已登记结果|未设置截止日期|当前待办|已逾期/);
  assert.deepEqual(store.state(), before);
});

test('英文周报涵盖空字段回退和活动动作，不将示例或计划写成真实成果', t => {
  const { store } = workspace(t);
  const project = store.create('projects', { title: 'Research', origin: 'demo' });
  const task = store.create('tasks', { projectId: project.id, title: 'Temporary task', origin: 'demo' });
  store.update('tasks', task.id, { version: 1, notes: 'Edited' });
  store.remove('tasks', task.id, 2);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  store.create('meetings', { projectId: project.id, title: 'Meeting', date: today, origin: 'demo' });
  store.create('reviews', { projectId: project.id, title: 'Advice', origin: 'demo' });
  let markdown = store.report(undefined, 'en').markdown;
  for (const text of ['Created', 'Updated', 'Deleted', '(demo)', 'feedback: Not entered', 'next steps: Not entered', 'No recommendations entered']) assert.ok(markdown.includes(text), text);
  assert.doesNotMatch(markdown, /[\u3400-\u9fff]/);
  store.clearDemo();
  store.importSnapshot({ schemaVersion: 1, projects: [{ id: 'imported-project', title: 'Imported research', origin: 'import' }] });
  markdown = store.report(undefined, 'en').markdown;
  assert.match(markdown, /Cleared demo/);
  assert.match(markdown, /Imported Project/);
  assert.doesNotMatch(markdown, /[\u3400-\u9fff]/);
});

test('CLI report 支持 --lang en，保留缺省中文并拒绝其他语言参数', t => {
  const { store, dataDir } = workspace(t);
  const project = store.create('projects', { title: '中文课题名' });
  const cli = args => spawnSync(process.execPath, ['cli.mjs', 'report', ...args], { cwd: root, env: { ...process.env, PHD_DATA_DIR: dataDir }, encoding: 'utf8' });
  const before = store.state();
  const english = cli(['--project', project.id, '--lang', 'en']);
  assert.equal(english.status, 0, english.stderr);
  assert.match(english.stdout, /^# Weekly Research Progress Report/);
  assert.match(english.stdout, /Scope: 中文课题名/);
  const chinese = cli(['--project', project.id]);
  assert.equal(chinese.status, 0, chinese.stderr);
  assert.match(chinese.stdout, /^# 科研进展周报/);
  const invalid = cli(['--lang', 'en-US']);
  assert.notEqual(invalid.status, 0);
  assert.equal(JSON.parse(invalid.stderr).code, 'INVALID_LOCALE');
  assert.equal(invalid.stdout, '');
  assert.deepEqual(store.state(), before);
});

test('HTTP report 的 lang 控制正文，Accept-Language 只控制错误且状态码保持不变', async t => {
  const { store, request } = await httpWorkspace(t);
  const before = store.state();
  const defaultReport = await request('/api/report', { language: 'en' });
  assert.equal(defaultReport.status, 200);
  assert.match(defaultReport.body.markdown, /^# 科研进展周报/);
  const english = await request('/api/report?lang=en', { language: 'zh' });
  assert.equal(english.status, 200);
  assert.match(english.body.markdown, /^# Weekly Research Progress Report/);
  for (const language of ['', 'fr', 'en-US', '../SKILL.md']) {
    const result = await request(`/api/report?lang=${encodeURIComponent(language)}`, { language: 'en-US,en;q=0.9' });
    assert.equal(result.status, 400);
    assert.deepEqual(result.body, { error: 'Language must be zh or en.', code: 'INVALID_LOCALE' });
  }
  const missing = await request('/api/report?projectId=missing&lang=en', { language: 'en' });
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'The research project does not exist.');
  assert.deepEqual(store.state(), before);
});

test('HTTP 英文错误覆盖固定校验、动态字段、引用、冲突和批量失败，用户标题不被翻译', async t => {
  const { store, request } = await httpWorkspace(t);
  const english = options => ({ ...options, language: 'en' });
  const blank = await request('/api/projects', english({ method: 'POST', data: { title: '' } }));
  assert.equal(blank.status, 400);
  assert.equal(blank.body.error, 'The title is required and must not exceed 500 characters.');
  const chinese = await request('/api/projects', { method: 'POST', data: { title: '' }, language: 'zh,en;q=0.5' });
  assert.match(chinese.body.error, /标题不能为空/);
  const field = await request('/api/projects', english({ method: 'POST', data: { title: 'Valid', '用户自定义字段': '原文' } }));
  assert.equal(field.body.error, 'Unsupported field: 用户自定义字段.');
  const project = store.create('projects', { title: '研究项目' });
  const paper = store.create('papers', { projectId: project.id, title: '研究论文' });
  const title = '标题不能为空，且不能超过 500 个字符。“用户原文”';
  const task = store.create('tasks', { projectId: project.id, title });
  const dependency = await request(`/api/projects/${project.id}`, english({ method: 'DELETE', data: { version: project.version } }));
  assert.equal(dependency.status, 409);
  assert.match(dependency.body.error, /still references/);
  const reference = await request('/api/experiments', english({ method: 'POST', data: { projectId: 'missing', title } }));
  assert.equal(reference.status, 400);
  assert.equal(reference.body.error, `“${title}” references a missing project: missing.`);
  const badDate = await request(`/api/tasks/${task.id}`, english({ method: 'PATCH', data: { version: 1, dueDate: '2026-02-30' } }));
  assert.equal(badDate.body.error, 'dueDate must be a valid YYYY-MM-DD date or an empty string.');
  store.update('papers', paper.id, { version: 1, progress: 40 });
  const before = store.state();
  const batch = await request('/api/batch', english({ method: 'POST', data: { operations: [
    { action: 'update', collection: 'tasks', id: task.id, data: { version: 1, status: 'done' } },
    { action: 'update', collection: 'papers', id: paper.id, data: { version: 1, progress: 60 } },
  ] } }));
  assert.equal(batch.status, 409);
  assert.equal(batch.body.code, 'VERSION_CONFLICT');
  assert.match(batch.body.error, /^Operation 2 failed; no changes in this batch were saved: The record has changed/);
  const validationBatch = await request('/api/batch', english({ method: 'POST', data: { operations: [{ action: 'create', collection: 'experiments', data: { projectId: project.id, title: 'No result', status: 'completed' } }] } }));
  assert.equal(validationBatch.status, 400);
  assert.match(validationBatch.body.error, /Operation 1 failed.*completed experiment requires both result and evidence/);
  const denied = await request('/api/projects', english({ method: 'POST', data: { title: 'Blocked' }, headers: { Origin: 'https://other.example' } }));
  assert.equal(denied.status, 403);
  assert.match(denied.body.error, /another website was blocked/);
  assert.deepEqual(store.state(), before);
});

test('错误翻译仅使用已知代码与模板，保留嵌入标题，未知消息原样回退', () => {
  assert.equal(requestLocale(), 'zh');
  assert.equal(requestLocale('en-US,en;q=0.9,zh;q=0.5'), 'en');
  assert.equal(requestLocale('en;q=0.3,zh-CN;q=0.8'), 'zh');
  assert.equal(requestLocale('en;q=0'), 'zh');
  assert.equal(requestLocale('fr,EN-gb;q=0.9'), 'en');
  const title = '“字段” 标题不能为空，且不能超过 500 个字符。\n第二行';
  const error = new StoreError(`“${title}” 仍引用待删除记录，请先解除关联或删除依赖记录。`, 'DEPENDENCY_CONFLICT', 409);
  assert.equal(localizeError(error, 'en'), `“${title}” still references a record being deleted. Remove the link or the dependent record first.`);
  assert.equal(localizeError(new StoreError('新增的未知校验错误。'), 'en'), '新增的未知校验错误。');
  assert.equal(localizeError(new StoreError('标题不能为空，且不能超过 500 个字符。', 'UNRECOGNIZED'), 'en'), '标题不能为空，且不能超过 500 个字符。');
  assert.equal(localizeError(error), error.message);
});

test('技能英文端点只返回对应 SKILL.en.md，默认中文且拒绝任意语言路径', async t => {
  const { store, request } = await httpWorkspace(t);
  const before = store.state();
  const catalog = JSON.parse(readFileSync(join(root, 'skills/catalog.json'), 'utf8'));
  for (const skill of catalog) {
    const english = await request(`/api/skills/${skill.id}?lang=en`, { language: 'en' });
    assert.equal(english.status, 200, skill.id);
    assert.equal(english.body.id, skill.id);
    assert.equal(english.body.content, readFileSync(join(root, 'skills', skill.id, 'SKILL.en.md'), 'utf8'));
  }
  const id = catalog[0].id;
  const chinese = await request(`/api/skills/${id}`, { language: 'en' });
  assert.equal(chinese.body.content, readFileSync(join(root, 'skills', id, 'SKILL.md'), 'utf8'));
  for (const language of ['', 'en-US', '../references/local-workflow']) {
    const invalid = await request(`/api/skills/${id}?lang=${encodeURIComponent(language)}`, { language: 'en' });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.code, 'INVALID_LOCALE');
  }
  assert.equal((await request('/api/skills/not-a-real-skill?lang=en', { language: 'en' })).status, 404);
  assert.deepEqual(store.state(), before);
});
