import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkills } from '../scripts/install-skills.mjs';

test('客户端适配可重复安装，共用技能保持同步', t => {
  const root = mkdtempSync(join(tmpdir(), 'phd-skills-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'skills/phd-manager'), { recursive: true });
  const source = join(root, 'skills/phd-manager/SKILL.md');
  writeFileSync(source, 'first');
  assert.equal(installSkills({ projectRoot: root, copy: false }).installed, 3);
  assert.equal(installSkills({ projectRoot: root, copy: false }).unchanged, 3);
  writeFileSync(source, 'updated');
  for (const dir of ['.agents', '.claude', '.codebuddy']) assert.equal(readFileSync(join(root, dir, 'skills/phd-manager/SKILL.md'), 'utf8'), 'updated');
});

test('安装预检保护已有技能，发生冲突前不写其他目录', t => {
  const root = mkdtempSync(join(tmpdir(), 'phd-skills-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'skills/phd-manager'), { recursive: true });
  writeFileSync(join(root, 'skills/phd-manager/SKILL.md'), 'new');
  mkdirSync(join(root, '.codebuddy/skills/phd-manager'), { recursive: true });
  writeFileSync(join(root, '.codebuddy/skills/phd-manager/SKILL.md'), 'user-owned');
  assert.throws(() => installSkills({ projectRoot: root }), /未覆盖/);
  assert.equal(existsSync(join(root, '.agents')), false);
  assert.equal(readFileSync(join(root, '.codebuddy/skills/phd-manager/SKILL.md'), 'utf8'), 'user-owned');
});
