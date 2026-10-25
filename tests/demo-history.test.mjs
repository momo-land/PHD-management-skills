import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { COLLECTIONS, createStore } from '../lib/store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

function workspace(t, demo = false) {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-demo-history-'));
  const store = createStore({ dataDir, demo });
  t.after(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); });
  const cli = (...args) => spawnSync(process.execPath, ['cli.mjs', ...args], {
    cwd: root, env: { ...process.env, PHD_DATA_DIR: dataDir }, encoding: 'utf8',
  });
  return { dataDir, store, cli };
}

function removedDemo(store) {
  const project = store.state().projects[0];
  store.update('projects', project.id, { version: project.version, notes: '示例修改一次' });
  store.update('projects', project.id, { version: project.version + 1, notes: '示例修改两次' });
  assert.deepEqual(store.clearDemo(), { removed: 19 });
  assert.equal(store.state().activity.length, 40);
}

test('清除已删除示例的 40 条历史，同步更新时间且重复执行不产生新记录', t => {
  const { store } = workspace(t, true);
  removedDemo(store);
  const before = store.state();
  assert.deepEqual(store.clearDemoHistory(), { removed: 40 });
  const after = store.state();
  assert.equal(after.activity.length, 0);
  assert.ok(Date.parse(after.updatedAt) > Date.parse(before.updatedAt));
  for (const collection of COLLECTIONS) assert.deepEqual(after[collection], before[collection]);
  assert.deepEqual(store.clearDemoHistory(), { removed: 0 });
  assert.deepEqual(store.state(), after);
});

test('保留所有非示例历史、现存记录的示例历史及 AI 对话，按 collection 和 id 匹配', t => {
  const { store, dataDir } = workspace(t);
  const project = store.create('projects', { id: 'shared-id', title: '真实课题', origin: 'user' });
  const demo = store.create('tasks', { projectId: project.id, title: '仍存在的示例任务', origin: 'demo' });
  store.update('tasks', demo.id, { version: demo.version, notes: '需要保留历史' });
  const deleted = store.create('tasks', { id: 'shared-id', projectId: project.id, title: '已删除示例', origin: 'demo' });
  store.remove('tasks', deleted.id, deleted.version);
  for (const origin of ['user', 'import', 'ai']) {
    const task = store.create('tasks', { projectId: project.id, title: `${origin} 已删除记录`, origin });
    store.remove('tasks', task.id, task.version);
  }
  const converted = store.create('tasks', { projectId: project.id, title: '由示例改成真实的任务', origin: 'demo' });
  store.update('tasks', converted.id, { version: converted.version, origin: 'user' });
  const before = store.state();
  mkdirSync(join(dataDir, 'assistant'));
  const chats = '{"conversations":[{"id":"keep-this-chat"}]}\n';
  writeFileSync(join(dataDir, 'assistant', 'conversations.json'), chats);
  assert.deepEqual(store.clearDemoHistory(), { removed: 2 });
  const after = store.state();
  for (const collection of COLLECTIONS) assert.deepEqual(after[collection], before[collection]);
  assert.deepEqual(after.activity, before.activity.filter(entry => entry.collection !== 'tasks' || entry.recordId !== deleted.id));
  assert.equal(readFileSync(join(dataDir, 'assistant', 'conversations.json'), 'utf8'), chats);
});

test('CLI 严格拒绝额外参数，不误清除历史并明确显示帮助', t => {
  const { store, cli } = workspace(t, true);
  removedDemo(store);
  const before = store.state();
  for (const args of [['extra'], ['--demo'], ['--file', '-'], ['--project', 'shared-id'], ['--dry-run'], ['--unknown']]) {
    const result = cli('clear-demo-history', ...args);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.deepEqual(store.state(), before);
  }
  const help = cli('help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /clear-demo-history\s+仅清除已删除示例的活动历史/);
  const clear = cli('clear-demo-history');
  assert.equal(clear.status, 0, clear.stderr);
  assert.deepEqual(JSON.parse(clear.stdout), { removed: 40 });
  assert.equal(store.state().activity.length, 0);
});

test('CLI 清除前导出的备份可回读恢复已删除示例历史，原目录保持空白', t => {
  const { store, cli, dataDir } = workspace(t, true);
  removedDemo(store);
  const before = store.state();
  const path = join(dataDir, 'backups', 'before-clear-history.json');
  const backup = cli('export', '--file', path);
  assert.equal(backup.status, 0, backup.stderr);
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), before);
  const cleared = cli('clear-demo-history');
  assert.equal(cleared.status, 0, cleared.stderr);
  const restored = workspace(t);
  const imported = restored.cli('import', '--file', path);
  assert.equal(imported.status, 0, imported.stderr);
  const recovered = restored.store.state();
  assert.deepEqual(new Set(recovered.activity.map(entry => JSON.stringify(entry))), new Set(before.activity.map(entry => JSON.stringify(entry))));
  for (const collection of COLLECTIONS) assert.deepEqual(recovered[collection], before[collection]);
  assert.equal(store.state().activity.length, 0);
});
