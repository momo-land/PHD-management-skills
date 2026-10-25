import test from 'node:test';
import assert from 'node:assert/strict';
import { researchProgress, completion, buildChatCommand, activationPrompt } from '../public/research-ui.mjs';

test('进度区分任务、论文自估及实验，不给空数据伪造百分比', () => {
  assert.equal(researchProgress({}).papers.percent, null);
  assert.equal(researchProgress({}).tasks.percent, null);
  const result = researchProgress({ papers: [{ progress: 20 }, { progress: 80 }], tasks: [{ status: 'done' }, { status: 'blocked' }, { status: 'in_progress' }], experiments: [{ status: 'planned' }, { status: 'running' }] });
  assert.equal(result.papers.percent, 50);
  assert.equal(result.tasks.percent, 33);
  assert.equal(result.experiments.percent, 0);
  assert.deepEqual(completion([{ status: 'done' }, { status: 'drafting' }], 'done'), { total: 2, completed: 1, percent: 50 });
});

test('对话短口令保留指定课题和原始材料，初次调用按客户端生成', () => {
  assert.equal(buildChatCommand({ label: '一键更新' }), '一键更新');
  const command = buildChatCommand({ label: '一键导入', project: { title: '真实课题', id: 'proj-123' }, material: '  仅完成大纲，实验尚未运行。  ' });
  assert.ok(command.includes('课题 ID：proj-123'));
  assert.ok(command.endsWith('仅完成大纲，实验尚未运行。'));
  assert.ok(activationPrompt('codex').startsWith('$phd-manager'));
  assert.ok(activationPrompt('claude').startsWith('/phd-manager'));
  assert.ok(activationPrompt('workbuddy').startsWith('使用 phd-manager 技能'));
});
