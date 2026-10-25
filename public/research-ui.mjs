// Shared presentation rules: percentages describe registered work, not research quality.
export function completion(items, completeStatus) {
  const total = items.length;
  const completed = items.filter(item => item.status === completeStatus).length;
  return { total, completed, percent: total ? Math.round(completed / total * 100) : null };
}

export function researchProgress({ papers = [], tasks = [], experiments = [] }) {
  return {
    papers: { total: papers.length, percent: papers.length ? Math.round(papers.reduce((sum, paper) => sum + paper.progress, 0) / papers.length) : null },
    tasks: completion(tasks, 'done'),
    experiments: completion(experiments, 'completed'),
  };
}

export const chatShortcuts = [
  { label: '一键更新', skillId: 'phd-progress', commandId: 'chat', icon: 'skills', description: '整理本次对话里的科研进展' },
  { label: '一键导入', skillId: 'phd-import', commandId: 'import', icon: 'upload', description: '把提供的材料合并到研究记录' },
  { label: '更新论文进度', skillId: 'phd-paper', icon: 'papers', description: '同步阶段、章节与明确的百分比' },
  { label: '更新实验进度', skillId: 'phd-experiment', icon: 'experiments', description: '登记实际进展、结果与证据' },
  { label: '整理导师反馈', skillId: 'phd-advisor', icon: 'guidance', description: '保存会议意见与后续行动' },
  { label: '生成周报', skillId: 'phd-weekly', icon: 'report', description: '汇总本期变更与当前阻塞' },
];

export function buildChatCommand({ label, project, material = '', language = 'zh' }) {
  if (language === 'en') return [label, project ? `Current project: ${project.title}\nProject ID: ${project.id}` : '', material.trim()].filter(Boolean).join('\n\n');
  return [label, project ? `当前课题：${project.title}\n课题 ID：${project.id}` : '', material.trim()].filter(Boolean).join('\n\n');
}

export function activationPrompt(client = 'codex', language = 'zh') {
  if (language === 'en') {
    const invocation = client === 'codex' ? '$phd-manager' : client === 'claude' ? '/phd-manager' : 'Use the phd-manager skill';
    return invocation + '\nRead AGENTS.md and skills/phd-manager/SKILL.en.md in the current PHD-management-skills project root and enter research management mode. When I say "Update progress", extract verifiable research progress from this chat and update the local database. When I say "Import progress", organize the material I supply and merge the progress. Execute clear updates directly and read them back; ask only when project ownership is unclear. If there is no research progress, create no records. Do not treat demo content or website development as research achievements. Reply in English and keep research content in its original language.';
  }
  const invocation = client === 'codex' ? '$phd-manager' : client === 'claude' ? '/phd-manager' : '使用 phd-manager 技能';
  return `${invocation}\n请读取当前 PHD-management-skills 项目根目录的 AGENTS.md 和 skills/phd-manager/SKILL.md，进入科研管理模式。后续我说“一键更新”时，整理本次对话中可核查的科研进展并更新本地数据库；我说“一键导入”时，整理我提供的材料并合并进度。充分明确的更新直接执行并回读，课题归属不明确时才询问。没有科研进展时不要创建记录，不要把示例或网站开发当作科研成果。`;
}
