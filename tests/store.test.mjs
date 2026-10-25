import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../lib/store.mjs';

function workspace(t, demo = false) {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-data-'));
  const store = createStore({ dataDir, demo });
  t.after(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); });
  return { dataDir, store };
}
function project(store, title = '真实研究课题') { return store.create('projects', { title, goal: '建立可验证的研究问题', status: 'active' }); }

test('跨客户端更新共用持久状态，旧版本不能覆盖新结果', t => {
  const { dataDir, store } = workspace(t);
  const p = project(store);
  const task = store.create('tasks', { projectId: p.id, title: '完成预实验协议' });
  const other = createStore({ dataDir });
  t.after(() => other.close());
  const changed = other.update('tasks', task.id, { version: task.version, status: 'in_progress', notes: '已确定对照条件' });
  assert.equal(store.state().tasks[0].notes, '已确定对照条件');
  assert.equal(changed.version, task.version + 1);
  assert.throws(() => store.update('tasks', task.id, { version: task.version, status: 'done' }));
  assert.equal(store.state().tasks[0].status, 'in_progress');
  assert.equal(store.state().activity.filter(x => x.recordId === task.id).length, 2);
});

test('实验完成需要真实结果说明与证据，不接受无效日期或任意字段', t => {
  const { store } = workspace(t);
  const p = project(store);
  const experiment = store.create('experiments', { projectId: p.id, title: '预实验', hypothesis: '干预可能改善指标' });
  const before = store.state().activity.length;
  assert.throws(() => store.update('experiments', experiment.id, { version: 1, status: 'completed', result: '已完成' }));
  assert.throws(() => store.create('tasks', { projectId: p.id, title: '错误日期', dueDate: '2026-02-30' }));
  assert.throws(() => store.create('papers', { projectId: p.id, title: '错误进度', progress: 101 }));
  assert.throws(() => store.create('tasks', { projectId: p.id, title: '未知字段', arbitrarySQL: 'x' }));
  assert.equal(store.state().activity.length, before);
  const result = store.update('experiments', experiment.id, { version: 1, status: 'completed', result: '没有观察到预期改善', evidence: 'runs/trial-01/metrics.json' });
  assert.equal(result.status, 'completed');
});

test('研究关系必须属于同一课题，被引用记录不能误删', t => {
  const { store } = workspace(t);
  const a = project(store, '课题 A'), b = project(store, '课题 B');
  const paper = store.create('papers', { projectId: a.id, title: 'A 的论文' });
  assert.throws(() => store.create('experiments', { projectId: b.id, title: '跨课题实验', paperId: paper.id }));
  const experiment = store.create('experiments', { projectId: a.id, title: '关联实验', paperId: paper.id });
  assert.throws(() => store.remove('papers', paper.id, paper.version));
  assert.throws(() => store.update('papers', paper.id, { version: paper.version, projectId: b.id }));
  assert.equal(store.state().papers[0].projectId, a.id);
  store.remove('experiments', experiment.id, experiment.version);
  store.remove('papers', paper.id, paper.version);
  assert.equal(store.state().papers.length, 0);
});

test('导入失败时整体回滚，备份可以恢复到空工作区', t => {
  const { store } = workspace(t);
  const p = project(store);
  store.create('papers', { projectId: p.id, title: '待投稿论文', progress: 40 });
  const snapshot = store.state();
  const { store: restored } = workspace(t);
  const invalid = structuredClone(snapshot);
  invalid.tasks.push({ id: 'invalid-task', projectId: 'missing-project', title: '非法引用' });
  assert.throws(() => restored.importSnapshot(invalid));
  assert.equal(restored.state().projects.length, 0);
  assert.equal(restored.state().activity.length, 0);
  restored.importSnapshot(snapshot);
  assert.equal(restored.state().papers[0].title, '待投稿论文');
  assert.equal(restored.state().papers[0].projectId, p.id);
  const changed = structuredClone(snapshot);
  changed.papers[0].progress = 60;
  restored.importSnapshot(changed);
  assert.equal(restored.state().papers[0].progress, 60);
  assert.throws(() => restored.importSnapshot({ ...snapshot, papers: [{ ...snapshot.papers[0], progress: 10 }] }));
  assert.equal(restored.state().papers[0].progress, 60);
});

test('示例只在首次初始化写入，清除示例保护用户关联内容', t => {
  const { store, dataDir } = workspace(t, true);
  assert.ok(store.state().projects.length > 0);
  assert.ok(store.state().papers.length > 0);
  const demoProject = store.state().projects[0];
  const personal = store.create('tasks', { projectId: demoProject.id, title: '用户的真实任务', origin: 'user' });
  assert.throws(() => store.clearDemo());
  assert.ok(store.state().tasks.some(x => x.id === personal.id));
  store.remove('tasks', personal.id, personal.version);
  assert.ok(store.clearDemo().removed > 0);
  assert.equal(store.state().projects.length, 0);
  const reopened = createStore({ dataDir, demo: true });
  t.after(() => reopened.close());
  assert.equal(reopened.state().projects.length, 0);
});

test('周报区分当前状态与近期更新，不将计划实验当作结果', t => {
  const { store } = workspace(t);
  const p = project(store);
  store.create('experiments', { projectId: p.id, title: '尚未执行的验证实验', status: 'planned' });
  store.create('tasks', { projectId: p.id, title: '等待数据许可', status: 'blocked', notes: '许可未到' });
  const output = store.report(p.id);
  const markdown = typeof output === 'string' ? output : output.markdown;
  assert.ok(markdown.includes('尚未执行的验证实验'));
  assert.ok(markdown.includes('等待数据许可'));
  assert.match(markdown, /计划|待执行|待开始|planned/);
  assert.match(markdown, /最近|近七|7 天|七天|七日|周期/);
});
