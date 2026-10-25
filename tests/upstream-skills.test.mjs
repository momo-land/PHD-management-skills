import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { verifyUpstreamSkills } from '../scripts/check-upstream-skills.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'phd-upstream-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const id = 'github-example';
  const bundle = `vendor/skills/${id}`;
  const original = `${bundle}/upstream/SKILL.md`;
  const license = `${bundle}/upstream-licenses/LICENSE.txt`;
  function write(path, contents) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  const sources = [
    [original, '---\nname: example\ndescription: Original upstream skill\n---\n# 原版\n'],
    [`${bundle}/upstream/references/example.md`, 'Reference content\n'],
    [license, 'MIT License\nCopyright example author\n'],
  ];
  const files = sources.map(([path, contents]) => {
    write(path, contents);
    return { path, sha256: createHash('sha256').update(contents).digest('hex'), bytes: Buffer.byteLength(contents) };
  });
  const revision = 'a'.repeat(40);
  const manifest = {
    schemaVersion: 1,
    installedAt: '2026-10-25',
    entries: [{
      id, repo: 'example/skills', revision, upstreamPath: 'skills/example',
      sourceUrl: `https://github.com/example/skills/tree/${revision}/skills/example`,
      upstreamSkill: original,
      license: { spdx: 'MIT', files: [license] },
      requirements: { zh: '无需额外依赖。', en: 'No additional dependencies.' },
      review: { level: 'source-inspected-not-executed', notesZh: '仅检查源文件。', notesEn: 'Source inspected only.' },
      files,
    }],
  };
  function save() { write('skills/upstream-lock.json', JSON.stringify(manifest)); }
  save();
  return { root, bundle, original, license, manifest, write, save, entry: manifest.entries[0] };
}

test('固定提交的上游整包和许可证通过校验，适配入口独立维护', t => {
  const f = fixture(t);
  f.write('skills/github-example/SKILL.md', 'Local adapter may change independently.');
  assert.deepEqual(verifyUpstreamSkills({ root: f.root }), {
    skills: 1, files: 3, bytes: f.entry.files.reduce((sum, file) => sum + file.bytes, 0),
  });
  f.entry.upstreamPath = '.';
  f.entry.license.spdx = 'Apache-2.0';
  f.save();
  assert.equal(verifyUpstreamSkills({ root: f.root }).skills, 1);
});

test('校验拒绝原件内容变化，包括相同字节长度的修改', async t => {
  await t.test('字节数变化', t => {
    const f = fixture(t);
    f.write(f.original, 'changed');
    assert.throws(() => verifyUpstreamSkills({ root: f.root }), /字节数不一致/);
  });
  await t.test('仅哈希变化', t => {
    const f = fixture(t);
    f.write(f.license, 'MIT License\nCopyright altered author\n');
    assert.throws(() => verifyUpstreamSkills({ root: f.root }), /SHA-256 不一致/);
  });
});

test('校验拒绝缺失文件和未登记的新增原件', async t => {
  await t.test('丢失许可证', t => {
    const f = fixture(t);
    rmSync(join(f.root, f.license));
    assert.throws(() => verifyUpstreamSkills({ root: f.root }), /缺失/);
  });
  for (const directory of ['upstream/references', 'upstream-licenses']) {
    await t.test(`额外文件 ${directory}`, t => {
      const f = fixture(t);
      f.write(`${f.bundle}/${directory}/.untracked`, 'not pinned');
      assert.throws(() => verifyUpstreamSkills({ root: f.root }), /未列入清单/);
    });
  }
});

test('校验拒绝路径越界、不规范路径及跨技能路径', async t => {
  for (const path of ['../outside.md', '/etc/passwd', 'C:/outside.md', 'vendor/skills/github-example/upstream/../outside.md', 'vendor\\skills\\outside.md', 'vendor/skills/github-other/upstream/SKILL.md']) {
    await t.test(path, t => {
      const f = fixture(t);
      f.entry.files[0].path = path;
      f.save();
      assert.throws(() => verifyUpstreamSkills({ root: f.root }), /路径|原件目录/);
    });
  }
  await t.test('清单路径不能越出项目', t => {
    const f = fixture(t);
    assert.throws(() => verifyUpstreamSkills({ root: f.root, manifestPath: '../upstream-lock.json' }), /路径越界/);
  });
});

test('校验拒绝文件链接和父目录链接，即使内容与哈希完全相同', async t => {
  for (const linkType of ['file', 'directory', 'ancestor']) {
    await t.test(linkType, t => {
      const f = fixture(t);
      const target = linkType === 'file' ? f.original : linkType === 'directory' ? `${f.bundle}/upstream` : 'vendor';
      const moved = join(f.root, 'linked-original');
      renameSync(join(f.root, target), moved);
      try { symlinkSync(moved, join(f.root, target), linkType === 'file' ? 'file' : 'dir'); }
      catch (error) {
        if (error.code === 'EPERM' || error.code === 'EACCES') { t.skip('当前系统不允许测试符号链接'); return; }
        throw error;
      }
      assert.throws(() => verifyUpstreamSkills({ root: f.root }), /符号链接/);
    });
  }
  await t.test('未列入清单的符号链接', t => {
    const f = fixture(t);
    try { symlinkSync(join(f.root, f.original), join(f.root, `${f.bundle}/upstream/extra.md`), 'file'); }
    catch (error) {
      if (error.code === 'EPERM' || error.code === 'EACCES') { t.skip('当前系统不允许测试符号链接'); return; }
      throw error;
    }
    assert.throws(() => verifyUpstreamSkills({ root: f.root }), /符号链接/);
  });
});

test('校验拒绝不完整、重复或未固定版本的清单元数据', async t => {
  const cases = [
    ['清单版本', f => { f.manifest.schemaVersion = 2; }, /schemaVersion/],
    ['不存在的日期', f => { f.manifest.installedAt = '2026-02-30'; }, /日期/],
    ['分支替代提交', f => { f.entry.revision = 'main'; }, /40 位/],
    ['缺少源仓库', f => { f.entry.repo = ''; }, /repo/],
    ['重复技能', f => { f.manifest.entries.push(structuredClone(f.entry)); }, /ID.*重复/],
    ['重复文件', f => { f.entry.files.push({ ...f.entry.files[0] }); }, /路径重复/],
    ['缺少原版技能条目', f => { f.entry.files.shift(); }, /SKILL.md 未列入/],
    ['缺少许可证条目', f => { f.entry.files.pop(); }, /许可证文件未列入/],
    ['缺少许可证声明', f => { f.entry.license.files = []; }, /许可证文件清单/],
    ['未知许可证', f => { f.entry.license.spdx = 'UNKNOWN'; }, /许可证标识/],
    ['不正确的原版入口', f => { f.entry.upstreamSkill = 'skills/github-example/SKILL.md'; }, /upstreamSkill/],
    ['非法哈希', f => { f.entry.files[0].sha256 = 'fake'; }, /SHA-256 无效/],
    ['非法字节数', f => { f.entry.files[0].bytes = -1; }, /字节数无效/],
    ['缺少英文依赖说明', f => { delete f.entry.requirements.en; }, /双语使用条件/],
    ['夸大检查范围', f => { f.entry.review.level = 'executed'; }, /来源检查说明/],
  ];
  for (const [name, change, expected] of cases) {
    await t.test(name, t => {
      const f = fixture(t);
      change(f);
      f.save();
      assert.throws(() => verifyUpstreamSkills({ root: f.root }), expected);
    });
  }
});
