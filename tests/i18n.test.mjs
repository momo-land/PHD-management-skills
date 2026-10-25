import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {english,translate,resolveLanguage,localizeSkill} from '../public/i18n.mjs';
import {buildChatCommand,activationPrompt,chatShortcuts} from '../public/research-ui.mjs';

test('language selection is explicit, persistent and defaults to Chinese',()=>{
 assert.equal(resolveLanguage(),'zh');
 assert.equal(resolveLanguage({saved:'en'}),'en');
 assert.equal(resolveLanguage({requested:'zh',saved:'en'}),'zh');
 assert.equal(resolveLanguage({requested:'xx',saved:'en'}),'en');
});
test('translation interpolates literal user content without recursively translating it',()=>{
 const title='论文 {count} $& <div>已完成</div>';
 assert.equal(translate('编辑{title}',{title},'en'),'Edit '+title);
 assert.equal(translate('编辑{title}',{title},'zh'),'编辑'+title);
 assert.equal(translate('unknown custom note',{},'en'),'unknown custom note');
});
test('every literal UI translation key has English copy and matching placeholders',()=>{
 const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 for(const match of source.matchAll(/\bt\((['"])(.*?)\1/g)){
  const key=match[2].replace(/\\n/g,'\n');
  assert.ok(Object.hasOwn(english,key),`Missing translation: ${key}`);
 }
 for(const [zh,en] of Object.entries(english)){
  const slots=text=>[...text.matchAll(/\{([A-Za-z]\w*)\}/g)].map(m=>m[1]).sort();
  assert.deepEqual(slots(en),slots(zh),`Placeholder mismatch: ${zh}`);
 }
});
test('English skill presentation preserves source catalog and action IDs',()=>{
 const catalog=JSON.parse(readFileSync(new URL('../skills/catalog.json',import.meta.url),'utf8'));
 for(const skill of catalog){
  const before=JSON.stringify(skill),en=localizeSkill(skill,'en');
  assert.equal(JSON.stringify(skill),before);
  assert.equal(en.id,skill.id);
  assert.equal(en.path,`skills/${skill.id}/SKILL.en.md`);
  assert.deepEqual(en.commands.map(c=>c.id),skill.commands.map(c=>c.id));
  assert.equal(localizeSkill(skill,'zh'),skill);
 }
});
test('English chat commands retain the exact research title, identifier and material',()=>{
 const project={title:'真实中文课题',id:'project-a'};
 const command=buildChatCommand({label:'Update progress',project,material:'\n结果：完成一项实验。\n',language:'en'});
 assert.equal(command,'Update progress\n\nCurrent project: 真实中文课题\nProject ID: project-a\n\n结果：完成一项实验。');
 assert.deepEqual(chatShortcuts.map(s=>translate(s.label,{},'en')),['Update progress','Import progress','Update paper progress','Update experiment progress','Summarize advisor feedback','Generate weekly report']);
 for(const client of ['codex','claude','workbuddy']){
  const text=activationPrompt(client,'en');
  assert.match(text,/SKILL.en.md/);assert.match(text,/Update progress/);
  assert.doesNotMatch(text,/[\u3400-\u9fff]/);
 }
});
