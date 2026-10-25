import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  assistantActionIds,assistantCopy,assistantMessageFits,assistantDraftWithCommand,validateAssistantFile,
  normalizeAssistantQuestions,assistantRequestAnswers,ASSISTANT_FILE_LIMIT,ASSISTANT_MESSAGE_LIMIT,
} from '../public/assistant.mjs';

test('assistant has complete bilingual copy for every quick action',()=>{
  const zh=assistantCopy('zh'),en=assistantCopy('en');
  assert.deepEqual(Object.keys(zh).sort(),Object.keys(en).sort());
  assert.equal(assistantCopy('unknown'),zh);
  for(const action of assistantActionIds){
    assert.ok(zh[action] && en[action]);assert.ok(zh[`${action}Hint`] && en[`${action}Hint`]);
  }
  for(const [key,value] of Object.entries(en)){
    assert.equal(typeof value,'string',key);assert.ok(value.length,key);
    assert.doesNotMatch(value,/[\u3400-\u9fff]/,key);
  }
});

test('material limits use UTF-8 bytes and include the entire message',()=>{
  assert.equal(ASSISTANT_MESSAGE_LIMIT,1024*1024);
  assert.equal(assistantMessageFits('a'.repeat(ASSISTANT_MESSAGE_LIMIT)),true);
  assert.equal(assistantMessageFits('a'.repeat(ASSISTANT_MESSAGE_LIMIT+1)),false);
  assert.equal(assistantMessageFits('研'.repeat(Math.floor(ASSISTANT_MESSAGE_LIMIT/3))),true);
  assert.equal(assistantMessageFits('研'.repeat(Math.floor(ASSISTANT_MESSAGE_LIMIT/3)+1)),false);
  assert.equal(validateAssistantFile({name:'notes.MD',size:ASSISTANT_FILE_LIMIT},'en'),'');
  assert.equal(validateAssistantFile({name:'notes.md',size:ASSISTANT_FILE_LIMIT+1},'en'),assistantCopy('en').fileLarge);
  assert.equal(validateAssistantFile({name:'notes.md.html',size:100},'en'),assistantCopy('en').fileType);
  assert.equal(validateAssistantFile({name:'results.csv',size:100},'zh'),'');
  assert.equal(validateAssistantFile({name:'notes.txt',size:-1},'en'),assistantCopy('en').fileLarge);
});

test('explicit shortcut commands replace only their untouched prefix and preserve research material',()=>{
  const material='论文结果：保持原文。\nMeasured accuracy: 85%. <literal>';
  for(const commands of [['更新论文进度','更新实验进度','生成周报'],['Update paper progress','Update experiment progress','Generate weekly report']]){
    let draft={text:material,action:'progress'};
    for(const command of commands){
      draft=assistantDraftWithCommand(draft,command);
      assert.equal(draft.text,`${command}\n\n${material}`);
      assert.equal(draft.commandPrefix,`${command}\n\n`);
      assert.equal(draft.action,'progress');
    }
    assert.equal(assistantDraftWithCommand(draft).text,material,'generic skills keep only the original material');
  }
  const changed={text:'用户改写后的要求\n\n'+material,commandPrefix:'更新论文进度\n\n'};
  assert.equal(assistantDraftWithCommand(changed,'生成周报').text,`生成周报\n\n${changed.text}`,'edited text is never removed');
  assert.deepEqual(assistantDraftWithCommand({text:'',action:'progress'},'Update paper progress'),{text:'Update paper progress\n\n',action:'progress',commandPrefix:'Update paper progress\n\n'});
});

test('input requests preserve identifiers, labels and free-text answers',()=>{
  const questions=[{id:'design',question:'What should change?',options:[{label:'Keep it',description:'No changes'},'Revise it']},{id:'scope',header:'Scope',options:null}];
  assert.deepEqual(normalizeAssistantQuestions(questions),[
    {id:'design',title:'What should change?',options:[{label:'Keep it',description:'No changes'},{label:'Revise it',description:''}]},
    {id:'scope',title:'Scope',options:[]},
  ]);
  assert.equal(assistantRequestAnswers(questions,{design:{option:'Keep it'}}),null);
  assert.deepEqual({...assistantRequestAnswers(questions,{design:{option:'Keep it',text:'  Custom scope  '},scope:{text:'研究原文'}})}, {
    design:{answers:['Custom scope']},scope:{answers:['研究原文']},
  });
  const hostile=assistantRequestAnswers([{id:'__proto__',question:'Any details?'}],JSON.parse('{"__proto__":{"text":"literal answer"}}'));
  assert.equal(Object.getPrototypeOf(hostile),null);
  assert.deepEqual(hostile.__proto__,{answers:['literal answer']});
});

test('assistant never inserts model HTML or collides with the main app action handler',()=>{
  const source=readFileSync(new URL('../public/assistant.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\.innerHTML\s*=|insertAdjacentHTML\s*\(/);
  assert.doesNotMatch(source,/\.dataset\.action\s*=|setAttribute\(['"]data-action['"]/);
  assert.doesNotMatch(source,/localStorage|sessionStorage/,'drafts stay in memory rather than browser storage');
  assert.match(source,/event\.isComposing/,'IME input is not sent mid-composition');
});
