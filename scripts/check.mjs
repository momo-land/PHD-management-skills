import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { verifyUpstreamSkills } from './check-upstream-skills.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let checked = 0;
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') || ['node_modules', 'data', 'backups', 'artifacts', 'vendor'].includes(item.name)) continue;
    const path = join(dir, item.name);
    if (item.isDirectory()) walk(path);
    else if (/\.(mjs|js)$/.test(item.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(result.stderr || `语法检查失败：${path}`);
      checked++;
    }
  }
}
function checkFrontmatter(path, id) {
  const text = readFileSync(path, 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1];
  if (!frontmatter || !new RegExp(`^name: ${id}\\s*$`, 'm').test(frontmatter) || !/^description: \S.+/m.test(frontmatter)) throw new Error(`技能 frontmatter 无效：${path}`);
}
function checkCommands(commands, label) {
  if (!Array.isArray(commands) || !commands.length || commands.length > 3) throw new Error(`技能 ${label} 指令清单无效`);
  const ids = new Set();
  for (const command of commands) {
    if (!command || !/^[a-z0-9-]+$/.test(command.id) || ids.has(command.id)) throw new Error(`技能 ${label} 指令 ID 无效或重复`);
    ids.add(command.id);
    for (const field of ['label', 'description', 'prompt', 'placeholder']) if (typeof command[field] !== 'string' || !command[field].trim()) throw new Error(`技能 ${label} 指令缺少 ${field}`);
  }
  return [...ids];
}
const checkedReferences = new Set();
function checkEnglishReferences(path) {
  if (checkedReferences.has(path)) return;
  checkedReferences.add(path);
  const text = readFileSync(path, 'utf8');
  for (const [, reference] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(reference) || reference.startsWith('#')) continue;
    const target = resolve(dirname(path), reference.split(/[?#]/)[0]);
    if (!existsSync(target)) throw new Error(`英文技能引用缺失：${path} -> ${reference}`);
    if (target.endsWith('.en.md')) checkEnglishReferences(target);
  }
}
try {
  walk(root);
  const catalog = JSON.parse(readFileSync(join(root, 'skills/catalog.json'), 'utf8'));
  const ids = new Set();
  for (const skill of catalog) {
    if (!/^[a-z0-9-]+$/.test(skill.id) || ids.has(skill.id)) throw new Error(`技能 ID 无效或重复：${skill.id}`);
    ids.add(skill.id);
    if (skill.path !== `skills/${skill.id}/SKILL.md`) throw new Error(`技能路径无效：${skill.id}`);
    for (const field of ['name', 'description', 'category', 'prompt']) if (typeof skill[field] !== 'string' || !skill[field].trim()) throw new Error(`技能 ${skill.id} 缺少 ${field}`);
    const commandIds = checkCommands(skill.commands, skill.id);
    if (!skill.en || typeof skill.en !== 'object' || Array.isArray(skill.en)) throw new Error(`技能 ${skill.id} 缺少英文元数据`);
    for (const field of ['name', 'description', 'category', 'prompt']) if (typeof skill.en[field] !== 'string' || !skill.en[field].trim()) throw new Error(`技能 ${skill.id} 英文元数据缺少 ${field}`);
    if (!['Project management', 'Paper writing', 'Experiments', 'Advisory'].includes(skill.en.category)) throw new Error(`技能 ${skill.id} 英文分类无效`);
    const englishCommandIds = checkCommands(skill.en.commands, `${skill.id}（英文）`);
    if (JSON.stringify(commandIds) !== JSON.stringify(englishCommandIds)) throw new Error(`技能 ${skill.id} 中英文指令 ID 或顺序不一致`);
    checkFrontmatter(join(root, skill.path), skill.id);
    const englishPath = join(root, 'skills', skill.id, 'SKILL.en.md');
    if (!existsSync(englishPath)) throw new Error(`英文技能说明缺失：${skill.id}`);
    checkFrontmatter(englishPath, skill.id);
    checkEnglishReferences(englishPath);
    if (!existsSync(join(root, 'skills', skill.id, 'agents/openai.yaml'))) throw new Error(`技能展示元数据缺失：${skill.id}`);
  }
  JSON.parse(readFileSync(join(root, 'fixtures/demo.json'), 'utf8'));
  const upstream = verifyUpstreamSkills({ root });
  const imported = JSON.parse(readFileSync(join(root, 'skills/upstream-lock.json'), 'utf8'));
  for (const entry of imported.entries) if (!ids.has(entry.id)) throw new Error(`上游技能未登记：${entry.id}`);
  console.log(`检查通过：${checked} 个脚本、${catalog.length} 个双语技能入口及引用、${upstream.skills} 个上游包/${upstream.files} 个原件文件、示例数据。`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
