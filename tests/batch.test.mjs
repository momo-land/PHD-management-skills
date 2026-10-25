import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createStore } from '../lib/store.mjs';
import { startServer } from '../server.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

function workspace(t) {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-batch-'));
  const stores = [];
  const connect = () => { const store = createStore({ dataDir }); stores.push(store); return store; };
  t.after(() => { for (const store of stores) store.close(); rmSync(dataDir, { recursive: true, force: true }); });
  return { dataDir, store: connect(), connect };
}
const create = (collection, data) => ({ action: 'create', collection, data });
const update = (collection, id, data) => ({ action: 'update', collection, id, data });

function linkedPlan() {
  return { operations: [
    create('projects', { id: 'batch-project', title: '科研计划', origin: 'ai' }),
    create('papers', { id: 'batch-paper', projectId: 'batch-project', title: '论文提纲', status: 'outline', origin: 'ai' }),
    create('experiments', { id: 'batch-experiment', projectId: 'batch-project', paperId: 'batch-paper', title: '待执行验证', status: 'planned', origin: 'ai' }),
    update('papers', 'batch-paper', { version: 1, experimentIds: ['batch-experiment'] }),
    create('tasks', { id: 'batch-task', projectId: 'batch-project', paperId: 'batch-paper', experimentId: 'batch-experiment', title: '补充实验协议', origin: 'ai' }),
  ] };
}

test('批量顺序执行可建立跨记录关联，并返回各项执行时的记录版本', t => {
  const { store } = workspace(t);
  const result = store.batch(linkedPlan());
  assert.equal(result.ok, true);
  assert.equal(result.dryRun, false);
  assert.equal(result.applied, 5);
  assert.deepEqual(result.results.map(item => item.index), [1, 2, 3, 4, 5]);
  assert.equal(result.results[1].record.version, 1);
  assert.equal(result.results[3].record.version, 2);
  const state = store.state();
  assert.deepEqual(state.papers[0].experimentIds, ['batch-experiment']);
  assert.equal(state.experiments[0].paperId, 'batch-paper');
  assert.equal(state.tasks[0].experimentId, 'batch-experiment');
  assert.equal(state.experiments[0].status, 'planned');
  assert.equal(state.experiments[0].result, '');
  assert.equal(state.activity.length, 5);
  assert.equal(state.activity.filter(entry => entry.action === 'update').length, 1);
});

test('后项验证失败回滚前项创建、更新、版本、更新时间和活动日志', t => {
  const { store, connect } = workspace(t);
  const project = store.create('projects', { title: '已有课题' });
  const task = store.create('tasks', { projectId: project.id, title: '已有待办' });
  const before = store.state();
  assert.throws(() => store.batch({ operations: [
    update('tasks', task.id, { version: task.version, status: 'in_progress' }),
    create('papers', { projectId: project.id, title: '这篇论文不应留下' }),
    create('experiments', { projectId: project.id, title: '缺少证据', status: 'completed', result: '无证据的记录' }),
  ] }), error => error.code === 'VALIDATION' && /第 3 项/.test(error.message) && /证据/.test(error.message));
  assert.deepEqual(store.state(), before);
  assert.deepEqual(connect().state(), before);
});

test('批量预览校验完整关联且回滚所有记录与日志，后续正式应用仍可成功', t => {
  const { store, connect } = workspace(t);
  const before = store.state();
  const preview = store.batch(linkedPlan(), { dryRun: true });
  assert.equal(preview.ok, true);
  assert.equal(preview.dryRun, true);
  assert.equal(preview.applied, 0);
  assert.equal(preview.results.length, 5);
  assert.equal(preview.results[3].record.version, 2);
  assert.deepEqual(store.state(), before);
  assert.deepEqual(connect().state(), before);
  const applied = store.batch(linkedPlan());
  assert.equal(applied.applied, 5);
  assert.equal(store.state().activity.length, 5);
  assert.equal(store.state().papers[0].version, 2);
  const after = store.state();
  assert.throws(() => store.batch({ operations: [
    create('tasks', { projectId: 'batch-project', title: '预览中也不可绕过结果检查' }),
    update('experiments', 'batch-experiment', { version: 1, status: 'completed' }),
  ] }, { dryRun: true }), { code: 'VALIDATION' });
  assert.deepEqual(store.state(), after);
});

test('预览不锁定未来版本：其他客户端更新后整批拒绝旧版本且不覆盖最新内容', t => {
  const { store, connect } = workspace(t);
  const project = store.create('projects', { title: '共享课题' });
  const task = store.create('tasks', { projectId: project.id, title: '协作任务' });
  const payload = { operations: [
    create('papers', { projectId: project.id, title: '失败时不应新增的论文' }),
    update('tasks', task.id, { version: task.version, status: 'done' }),
  ] };
  store.batch(payload, { dryRun: true });
  const other = connect();
  other.update('tasks', task.id, { version: task.version, notes: '其他客户端刚补充的信息', status: 'in_progress' });
  const latest = other.state();
  assert.throws(() => store.batch(payload), error => error.code === 'VERSION_CONFLICT' && error.status === 409 && /第 2 项/.test(error.message));
  assert.deepEqual(store.state(), latest);
});

test('同批重复更新必须使用前项后的版本，顺序错误和跨课题引用也会整体回滚', t => {
  const { store } = workspace(t);
  const a = store.create('projects', { id: 'a', title: '课题 A' });
  const b = store.create('projects', { id: 'b', title: '课题 B' });
  const paper = store.create('papers', { projectId: a.id, title: 'A 的论文' });
  const before = store.state();
  const invalidBatches = [
    [update('papers', paper.id, { version: paper.version, status: 'outline' }), update('papers', paper.id, { version: paper.version, status: 'drafting' })],
    [create('tasks', { projectId: a.id, title: '不应留下' }), create('experiments', { projectId: b.id, paperId: paper.id, title: '跨课题引用' })],
    [create('experiments', { projectId: a.id, paperId: 'future-paper', title: '不能前向引用' }), create('papers', { id: 'future-paper', projectId: a.id, title: '后创建的论文' })],
  ];
  for (const operations of invalidBatches) {
    assert.throws(() => store.batch({ operations }));
    assert.deepEqual(store.state(), before);
  }
});

test('批量协议拒绝删除、未知字段、缺失版本和超限数量，支持最多100项', t => {
  const { store } = workspace(t);
  const before = store.state();
  const invalidPayloads = [
    null, [], {}, { operations: [] }, { operations: new Array(1) },
    { operations: [create('projects', { title: '不应写入' })], dryRun: true },
    { operations: [{ action: 'delete', collection: 'projects', id: 'missing' }] },
    { operations: [{ action: 'create', collection: 'projects', id: 'wrong-place', data: { title: 'ID 应在 data 中' } }] },
    { operations: [create('projects', { id: 'new', title: '临时课题' }), update('projects', 'new', { title: '缺少版本' })] },
    { operations: Array.from({ length: 101 }, (_, index) => create('projects', { id: `over-${index}`, title: '超出上限' })) },
  ];
  for (const payload of invalidPayloads) {
    assert.throws(() => store.batch(payload), { code: 'VALIDATION' });
    assert.deepEqual(store.state(), before);
  }
  assert.throws(() => store.batch(linkedPlan(), { dryRun: 'false' }), { code: 'VALIDATION' });
  assert.throws(() => store.batch(linkedPlan(), { unknown: true }), { code: 'VALIDATION' });
  assert.deepEqual(store.state(), before);
  const result = store.batch({ operations: Array.from({ length: 100 }, (_, index) => create('projects', { id: `limit-${index}`, title: `第 ${index + 1} 个课题` })) });
  assert.equal(result.applied, 100);
  assert.equal(store.state().projects.length, 100);
  assert.equal(store.state().activity.length, 100);
});

test('CLI 批量支持文件与标准输入，预览无写入，失败非零退出且回滚', t => {
  const { dataDir, store } = workspace(t);
  const cli = (args, input) => spawnSync(process.execPath, ['cli.mjs', ...args], { cwd: root, env: { ...process.env, PHD_DATA_DIR: dataDir }, encoding: 'utf8', input: input === undefined ? undefined : JSON.stringify(input) });
  const file = join(dataDir, 'progress.json');
  writeFileSync(file, JSON.stringify(linkedPlan()));
  const before = store.state();
  const preview = cli(['batch', '--file', file, '--dry-run']);
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(JSON.parse(preview.stdout).applied, 0);
  assert.equal(JSON.parse(preview.stdout).dryRun, true);
  assert.deepEqual(store.state(), before);
  const applied = cli(['batch', '--file', '-'], linkedPlan());
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(JSON.parse(applied.stdout).applied, 5);
  const saved = store.state();
  const conflict = cli(['batch', '--file', '-'], { operations: [
    create('tasks', { projectId: 'batch-project', title: '不能部分保存' }),
    update('papers', 'batch-paper', { version: 1, progress: 90 }),
  ] });
  assert.notEqual(conflict.status, 0);
  assert.equal(JSON.parse(conflict.stderr).code, 'VERSION_CONFLICT');
  assert.match(JSON.parse(conflict.stderr).error, /第 2 项/);
  assert.equal(conflict.stdout, '');
  assert.deepEqual(store.state(), saved);
});

test('HTTP 批量接口支持预览及应用，拒绝跨站请求并原子返回版本冲突', async t => {
  let server;
  t.after(async () => { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } });
  const { dataDir, store } = workspace(t);
  server = await startServer({ dataDir, demo: false, port: 0 });
  const url = `http://127.0.0.1:${server.address().port}/api/batch`;
  const post = body => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const before = store.state();
  const preview = await post({ ...linkedPlan(), dryRun: true });
  assert.equal(preview.status, 200);
  assert.equal((await preview.json()).applied, 0);
  assert.deepEqual(store.state(), before);
  const denied = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify(linkedPlan()) });
  assert.equal(denied.status, 403);
  assert.deepEqual(store.state(), before);
  const invalid = await post({ ...linkedPlan(), dryRun: 'false' });
  assert.equal(invalid.status, 400);
  assert.deepEqual(store.state(), before);
  const applied = await post(linkedPlan());
  assert.equal(applied.status, 200);
  assert.equal((await applied.json()).applied, 5);
  const saved = store.state();
  const conflict = await post({ operations: [
    create('tasks', { projectId: 'batch-project', title: '不可部分保存' }),
    update('papers', 'batch-paper', { version: 1, progress: 99 }),
  ] });
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).code, 'VERSION_CONFLICT');
  assert.deepEqual(store.state(), saved);
});
