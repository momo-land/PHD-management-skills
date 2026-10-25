import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { startServer } from '../server.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('环境检查不创建数据库，首次显式初始化仍可装载示例', t => {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-doctor-'));
  t.after(() => rmSync(dataDir, { recursive: true, force: true }));
  const run = args => spawnSync(process.execPath, ['cli.mjs', ...args], { cwd: root, env: { ...process.env, PHD_DATA_DIR: dataDir }, encoding: 'utf8' });
  const doctor = run(['doctor']);
  assert.equal(doctor.status, 0, doctor.stderr);
  assert.equal(JSON.parse(doctor.stdout).initialized, false);
  assert.equal(existsSync(join(dataDir, 'research.sqlite')), false);
  const initialized = run(['init', '--demo']);
  assert.equal(initialized.status, 0, initialized.stderr);
  assert.equal(JSON.parse(initialized.stdout).demo, true);
  assert.ok(JSON.parse(initialized.stdout).counts.projects > 0);
});
async function setup(t) {
  const dataDir = mkdtempSync(join(tmpdir(), 'phd-http-'));
  const server = await startServer({ dataDir, demo: false, port: 0 });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    rmSync(dataDir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method = 'GET', data, headers = {}) => {
    const response = await fetch(`${base}${path}`, { method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  const cli = (args, input) => spawnSync(process.execPath, ['cli.mjs', ...args], { cwd: root, env: { ...process.env, PHD_DATA_DIR: dataDir }, encoding: 'utf8', input });
  return { base, request, dataDir, cli };
}

test('HTTP 与 CLI 可接续操作同一数据，冲突写入返回409', async t => {
  const { request, cli } = await setup(t);
  const p = await request('/api/projects', 'POST', { title: '接口验收课题' });
  assert.equal(p.status, 201);
  const created = cli(['add', 'papers', '--file', '-'], JSON.stringify({ projectId: p.body.id, title: '跨客户端论文', status: 'outline' }));
  assert.equal(created.status, 0, created.stderr);
  const paper = JSON.parse(created.stdout);
  let state = await request('/api/state');
  assert.equal(state.body.papers[0].title, '跨客户端论文');
  const edited = await request(`/api/papers/${paper.id}`, 'PATCH', { version: paper.version, progress: 35 });
  assert.equal(edited.status, 200);
  const stale = cli(['update', 'papers', paper.id, '--file', '-'], JSON.stringify({ version: paper.version, progress: 10 }));
  assert.notEqual(stale.status, 0);
  const conflict = await request(`/api/papers/${paper.id}`, 'PATCH', { version: paper.version, progress: 11 });
  assert.equal(conflict.status, 409);
  state = await request('/api/state');
  assert.equal(state.body.papers[0].progress, 35);
  assert.equal((await request('/api/report')).status, 200);
});

test('本地服务拒绝跨站写入并隔离项目源码与运行数据', async t => {
  const { request, base } = await setup(t);
  const denied = await request('/api/projects', 'POST', { title: '不应写入' }, { Origin: 'https://example.com' });
  assert.equal(denied.status, 403);
  assert.equal((await request('/api/state')).body.projects.length, 0);
  const invalidType = await fetch(`${base}/api/projects`, { method: 'POST', body: '{"title":"不应写入"}', headers: { 'Content-Type': 'text/plain' } });
  assert.equal(invalidType.status, 400);
  const malformed = await fetch(`${base}/api/projects`, { method: 'POST', body: '{broken', headers: { 'Content-Type': 'application/json' } });
  assert.equal(malformed.status, 400);
  for (const path of ['/cli.mjs', '/data/research.sqlite', '/%2e%2e%2fREADME.md', '/api/skills/unknown-skill']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 404, path);
  }
});

test('备份导出可创建目录，导入保留原始历史且重复导入不复制历史', async t => {
  const { request, dataDir, cli } = await setup(t);
  const p = await request('/api/projects', 'POST', { title: '需要恢复的课题' });
  await request(`/api/projects/${p.body.id}`, 'PATCH', { version: p.body.version, goal: '保留研究变化' });
  const backupPath = join(dataDir, 'nested/backups/research.json');
  const exported = cli(['export', '--file', backupPath]);
  assert.equal(exported.status, 0, exported.stderr);
  const snapshot = JSON.parse(readFileSync(backupPath, 'utf8'));
  assert.equal(snapshot.activity.length, 2);
  const newDataDir = mkdtempSync(join(tmpdir(), 'phd-restore-'));
  t.after(() => rmSync(newDataDir, { recursive: true, force: true }));
  const restore = () => spawnSync(process.execPath, ['cli.mjs', 'import', '--file', backupPath], { cwd: root, env: { ...process.env, PHD_DATA_DIR: newDataDir }, encoding: 'utf8' });
  assert.equal(restore().status, 0);
  assert.equal(restore().status, 0);
  const restored = spawnSync(process.execPath, ['cli.mjs', 'state'], { cwd: root, env: { ...process.env, PHD_DATA_DIR: newDataDir }, encoding: 'utf8' });
  assert.equal(restored.status, 0);
  const state = JSON.parse(restored.stdout);
  for (const event of snapshot.activity) assert.equal(state.activity.filter(item => item.id === event.id).length, 1);
  assert.equal(state.projects[0].goal, '保留研究变化');
});

test('技能API仅返回已登记的完整技能，不执行prompt', async t => {
  const { request } = await setup(t);
  const catalog = await request('/api/skills');
  assert.equal(catalog.status, 200);
  const registered = JSON.parse(readFileSync(join(root, 'skills/catalog.json'), 'utf8'));
  assert.deepEqual(catalog.body, registered);
  for (const item of catalog.body) {
    for (const lang of ['zh', 'en']) {
      const skill = await request(`/api/skills/${item.id}?lang=${lang}`);
      assert.equal(skill.status, 200);
      const filename = lang === 'en' ? 'SKILL.en.md' : 'SKILL.md';
      assert.equal(skill.body.content, readFileSync(join(root, 'skills', item.id, filename), 'utf8'));
    }
  }
  assert.equal((await request('/api/state')).body.projects.length, 0);
});
