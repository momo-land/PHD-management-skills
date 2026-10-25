import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function requireValue(condition, message) {
  if (!condition) throw new Error(`上游技能校验失败：${message}`);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pathParts(path) {
  requireValue(isText(path) && !/[\\\0:]/.test(path), `路径无效：${String(path)}`);
  const parts = path.split('/');
  requireValue(parts.every(part => part && part !== '.' && part !== '..'), `路径越界或不规范：${path}`);
  return parts;
}

// Check every component before reading so a directory link cannot bypass the bundle boundary.
function checkedPath(root, path, kind) {
  let current = root;
  const parts = pathParts(path);
  for (let index = 0; index < parts.length; index++) {
    current = join(current, parts[index]);
    let stat;
    try { stat = lstatSync(current); }
    catch (error) {
      if (error.code === 'ENOENT') throw new Error(`上游技能校验失败：文件或目录缺失：${path}`);
      throw error;
    }
    requireValue(!stat.isSymbolicLink(), `不允许符号链接：${path}`);
    const needsDirectory = index < parts.length - 1 || kind === 'directory';
    requireValue(needsDirectory ? stat.isDirectory() : stat.isFile(), `不是普通${needsDirectory ? '目录' : '文件'}：${path}`);
  }
  return current;
}

function collectFiles(root, directory) {
  const absolute = checkedPath(root, directory, 'directory');
  const files = [];
  for (const item of readdirSync(absolute, { withFileTypes: true })) {
    const path = `${directory}/${item.name}`;
    requireValue(!item.isSymbolicLink(), `不允许符号链接：${path}`);
    if (item.isDirectory()) files.push(...collectFiles(root, path));
    else {
      requireValue(item.isFile(), `不是普通文件：${path}`);
      files.push(path);
    }
  }
  return files;
}

/** Verify the pinned originals without network access, installing packages, or executing their code. */
export function verifyUpstreamSkills({ root = repoRoot, manifestPath = 'skills/upstream-lock.json' } = {}) {
  root = resolve(root);
  const rootStat = lstatSync(root);
  requireValue(rootStat.isDirectory() && !rootStat.isSymbolicLink(), '项目根必须是普通目录');
  const manifest = JSON.parse(readFileSync(checkedPath(root, manifestPath, 'file'), 'utf8'));
  requireValue(manifest && manifest.schemaVersion === 1, '不支持的清单 schemaVersion');
  requireValue(/^\d{4}-\d{2}-\d{2}$/.test(manifest.installedAt ?? '') &&
    !Number.isNaN(Date.parse(manifest.installedAt)) &&
    new Date(manifest.installedAt).toISOString().slice(0, 10) === manifest.installedAt, 'installedAt 日期无效');
  requireValue(Array.isArray(manifest.entries), 'entries 必须是数组');

  const ids = new Set();
  const allPaths = new Set();
  let totalBytes = 0;
  for (const entry of manifest.entries) {
    requireValue(entry && typeof entry === 'object' && !Array.isArray(entry), '技能条目无效');
    const { id } = entry;
    requireValue(typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && !ids.has(id), `技能 ID 无效或重复：${id}`);
    ids.add(id);
    requireValue(isText(entry.repo), `${id} 缺少 repo`);
    requireValue(typeof entry.revision === 'string' && /^[a-f0-9]{40}$/i.test(entry.revision), `${id} revision 必须固定到 40 位提交 SHA`);
    requireValue(isText(entry.sourceUrl), `${id} 缺少 sourceUrl`);
    if (entry.upstreamPath !== '.') pathParts(entry.upstreamPath);
    requireValue(isText(entry.requirements?.zh) && isText(entry.requirements?.en), `${id} 缺少双语使用条件`);
    requireValue(entry.review?.level === 'source-inspected-not-executed' &&
      isText(entry.review.notesZh) && isText(entry.review.notesEn), `${id} 来源检查说明无效`);

    const bundle = `vendor/skills/${id}`;
    const originalPrefix = `${bundle}/upstream/`;
    const licensePrefix = `${bundle}/upstream-licenses/`;
    requireValue(entry.upstreamSkill === `${originalPrefix}SKILL.md`, `${id} upstreamSkill 路径无效`);
    requireValue(['MIT', 'Apache-2.0'].includes(entry.license?.spdx), `${id} 许可证标识无效`);
    requireValue(Array.isArray(entry.license.files) && entry.license.files.length > 0 &&
      new Set(entry.license.files).size === entry.license.files.length, `${id} 许可证文件清单无效或重复`);
    requireValue(Array.isArray(entry.files) && entry.files.length > 0, `${id} 缺少文件校验清单`);

    const listed = new Set();
    for (const file of entry.files) {
      requireValue(file && typeof file === 'object' && !Array.isArray(file), `${id} 文件条目无效`);
      pathParts(file.path);
      requireValue(file.path.startsWith(originalPrefix) || file.path.startsWith(licensePrefix), `${id} 文件不在原件目录内：${file.path}`);
      requireValue(!allPaths.has(file.path), `文件路径重复：${file.path}`);
      allPaths.add(file.path);
      listed.add(file.path);
      requireValue(typeof file.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(file.sha256), `SHA-256 无效：${file.path}`);
      requireValue(Number.isSafeInteger(file.bytes) && file.bytes >= 0, `文件字节数无效：${file.path}`);
      const contents = readFileSync(checkedPath(root, file.path, 'file'));
      requireValue(contents.length === file.bytes, `文件字节数不一致：${file.path}`);
      const actualHash = createHash('sha256').update(contents).digest('hex');
      requireValue(actualHash === file.sha256.toLowerCase(), `文件 SHA-256 不一致：${file.path}`);
      totalBytes += contents.length;
    }
    requireValue(listed.has(entry.upstreamSkill), `${id} 原版 SKILL.md 未列入校验清单`);
    for (const licensePath of entry.license.files) {
      pathParts(licensePath);
      requireValue(licensePath.startsWith(licensePrefix) && listed.has(licensePath), `${id} 许可证文件未列入校验清单或路径无效：${licensePath}`);
    }
    for (const path of [...collectFiles(root, `${bundle}/upstream`), ...collectFiles(root, `${bundle}/upstream-licenses`)]) {
      requireValue(listed.has(path), `发现未列入清单的原件：${path}`);
    }
  }
  return { skills: ids.size, files: allPaths.size, bytes: totalBytes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = verifyUpstreamSkills();
    console.log(`上游原件检查通过：${result.skills} 个技能、${result.files} 个文件、${result.bytes} 字节。`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
