import { existsSync, mkdirSync, readdirSync, lstatSync, readlinkSync, symlinkSync, cpSync, readFileSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOSTS = { codex: '.agents', claude: '.claude', workbuddy: '.codebuddy' };

function sameDirectory(a, b) {
  const names = readdirSync(a).sort();
  if (JSON.stringify(names) !== JSON.stringify(readdirSync(b).sort())) return false;
  return names.every(name => {
    const x = join(a, name), y = join(b, name);
    const xs = lstatSync(x), ys = lstatSync(y);
    if (xs.isSymbolicLink() || ys.isSymbolicLink()) return false;
    if (xs.isDirectory() !== ys.isDirectory()) return false;
    return xs.isDirectory() ? sameDirectory(x, y) : readFileSync(x).equals(readFileSync(y));
  });
}

export function installSkills({ projectRoot = ROOT, target = 'all', copy = process.platform === 'win32' } = {}) {
  const targets = target === 'all' ? Object.keys(HOSTS) : [target];
  if (targets.some(item => !HOSTS[item])) throw new Error('target 必须是 codex、claude、workbuddy 或 all。');
  const skillRoot = join(projectRoot, 'skills');
  const skills = readdirSync(skillRoot).filter(name => /^[a-z0-9-]+$/.test(name) && existsSync(join(skillRoot, name, 'SKILL.md')));
  if (!skills.length) throw new Error('没有找到技能包。');
  const actions = [];
  // Preflight all destinations before writing. Existing unrelated files are never replaced.
  for (const host of targets) {
    for (const skill of skills) {
      const source = join(skillRoot, skill), dest = join(projectRoot, HOSTS[host], 'skills', skill);
      let stat;
      try { stat = lstatSync(dest); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      let unchanged = false;
      if (stat?.isSymbolicLink()) unchanged = resolve(dirname(dest), readlinkSync(dest)) === source;
      else if (stat?.isDirectory()) unchanged = sameDirectory(source, dest);
      if (stat && !unchanged) throw new Error(`已有不同内容，未覆盖：${dest}。请先备份并移开该目录，再重试。`);
      actions.push({ host, skill, source, dest, unchanged });
    }
  }
  for (const item of actions) {
    if (item.unchanged) continue;
    mkdirSync(dirname(item.dest), { recursive: true });
    if (copy) cpSync(item.source, item.dest, { recursive: true, errorOnExist: true, force: false });
    else symlinkSync(relative(dirname(item.dest), item.source), item.dest, 'dir');
  }
  return { installed: actions.filter(x => !x.unchanged).length, unchanged: actions.filter(x => x.unchanged).length, mode: copy ? 'copy' : 'link', targets, skills };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
      console.log('用法：npm run skills:install -- [--target all|codex|claude|workbuddy] [--copy]\n只写当前项目的客户端技能目录，不修改全局配置。默认使用相对链接，Windows 默认复制。');
    } else {
      let target = 'all', copy = process.platform === 'win32';
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--copy') copy = true;
        else if (args[i] === '--target' && args[i + 1]) target = args[++i];
        else throw new Error(`未知参数：${args[i]}`);
      }
      console.log(JSON.stringify(installSkills({ target, copy }), null, 2));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
