import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {translate} from '../public/i18n.mjs';

// Exercise the page event handlers with an in-memory DOM model. No browser or model calls.
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^init\(\);$/m,'');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function setup({language='en',handler=async()=>({id:'advice-chat'}),projects=[{id:'p1',title:'Research A'}]}={}){
  const calls=[],nodes=new Map();let rendering=0;
  const node=id=>{if(!nodes.has(id))nodes.set(id,{id,value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,open:false,focus(){document.activeElement=this;},scrollIntoView(){},setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;},showModal(){this.open=true;},close(){this.open=false;},classList:{toggle(){}}});return nodes.get(id);};
  const document={activeElement:null,querySelector(selector){return nodes.get(selector.replace(/^#/,''))||null;},querySelectorAll(){return [];}};
  for(const id of ['content','advice-project','advice-focus','editor-dialog','detail-dialog','editor-content','editor-error','field-title','field-assessment','field-notes','save-record','review-import-file','review-import-status'])node(id);
  const context=vm.createContext({document,window:{scrollTo(){}},location:{hash:'#guidance'},console,Intl,Date,TextDecoder,crypto:{randomUUID},structuredClone,setTimeout,clearTimeout,t:(key,params)=>translate(key,params,language),lang:()=>language,locale:()=>language==='en'?'en-US':'zh-CN',createAssistantWorkspace:()=>({unmount(){},mount(){},async startAdvice(input){calls.push({...input});return handler(input);}})});
  vm.runInContext(source,context);
  context.testProjects=projects;context.rendered=()=>rendering++;
  vm.runInContext("state.projects=testProjects;ui.view='guidance';ui.guidanceTab='reviews';loaded=true;renderBody=()=>rendered();toast=()=>{};",context);
  const run=code=>vm.runInContext(code,context);
  node('advice-project').value=projects.length===1?projects[0].id:'';
  return {run,node,nodes,context,calls,get rendering(){return rendering;},draft:()=>run('adviceDraft'),setEditor(){run("editorContext={collection:'reviews',busy:false,importBusy:false,isNew:true};");node('editor-dialog').open=true;},file(file){context.testFile=file;return run('importAdviceFile(testFile)');},submit(){return run('generateAdvice({preventDefault(){}})');}};
}

test('advice navigation is passive, explicit for multiple projects, and safe in both languages',()=>{
  for(const language of ['zh','en']){
    const ui=setup({language,projects:[{id:'p1',title:'<script>research</script>'},{id:'p2',title:'Another'}]});
    const html=ui.run('renderGuidance()');assert.equal(ui.calls.length,0);assert.match(html,/id="advice-form"/);assert.match(html,/data-action="advice-import"/);
    assert.match(html,/&lt;script&gt;research&lt;\/script&gt;/);assert.doesNotMatch(html,/<script>/);assert.equal(ui.run('adviceProjectId()'),'');
    ui.run("ui.projectId='p2'");assert.equal(ui.run('adviceProjectId()'),'p2');
    ui.run("adviceDraft.projectId='p1';adviceDraft.focus='keep <draft>';ui.projectId='p2'");assert.equal(ui.run('adviceProjectId()'),'p1');assert.match(ui.run('renderGuidance()'),/keep &lt;draft&gt;/);
    if(language==='en')assert.doesNotMatch(html,/[\u3400-\u9fff]/);
    ui.run('state.projects=[]');assert.match(ui.run('renderGuidance()'),/data-collection="projects"/);assert.doesNotMatch(ui.run('renderGuidance()'),/id="advice-generate"/);
  }
});

test('generation requires a target, prevents double clicks, and opens its new chat without claiming advice saved',async()=>{
  const job=deferred(),ui=setup({handler:()=>job.promise,projects:[{id:'p1',title:'A'},{id:'p2',title:'B'}]});
  await ui.submit();assert.equal(ui.calls.length,0);assert.match(ui.draft().error,/choose a project/i);
  ui.node('advice-project').value='p2';ui.node('advice-focus').value='  Compare the next experiments  ';
  const first=ui.submit();assert.equal(ui.draft().busy,true);await ui.submit();assert.equal(ui.calls.length,1);assert.equal(ui.calls[0].projectId,'p2');assert.equal(ui.calls[0].focus,'Compare the next experiments');
  job.resolve({id:'new-chat',status:'running'});await first;assert.equal(ui.context.location.hash,'assistant');assert.equal(ui.draft().busy,false);assert.equal(ui.draft().attempt,null);
});

test('uncertain results reuse the same request and target while a definitive rejection allows editing',async()=>{
  let count=0;const ui=setup({handler:async()=>{if(count++===0)throw new Error('Connection lost');return {id:'recovered'};}});
  ui.node('advice-focus').value='Original question';await ui.submit();assert.equal(ui.draft().uncertain,true);const first=ui.calls[0];
  ui.node('advice-focus').value='Changed outside disabled form';ui.node('advice-project').value='p-other';await ui.submit();assert.deepEqual(ui.calls[1],first);assert.equal(ui.draft().uncertain,false);
  const rejected=setup({handler:async()=>{throw Object.assign(new Error('Unavailable project'),{status:404});}});
  await rejected.submit();assert.equal(rejected.draft().uncertain,false);assert.equal(rejected.draft().attempt,null);
  rejected.node('advice-focus').value='Revised';await rejected.submit();assert.notEqual(rejected.calls[0].requestId,rejected.calls[1].requestId);assert.equal(rejected.calls[1].focus,'Revised');
});

test('focus and selection survive a page refresh without moving focus into a disabled form',()=>{
  const ui=setup(),field=ui.node('advice-focus');field.focus();field.selectionStart=3;field.selectionEnd=7;
  const saved=ui.run('captureAdviceFocus()');ui.context.saved=saved;ui.context.document.activeElement=null;ui.run('restoreAdviceFocus(saved)');assert.equal(ui.context.document.activeElement,field);assert.equal(field.selectionStart,3);assert.equal(field.selectionEnd,7);
  field.disabled=true;ui.context.document.activeElement=null;ui.run('restoreAdviceFocus(saved)');assert.equal(ui.context.document.activeElement,null);
});

test('manual import opens an editable advice record without running Codex and preserves an explicit project',async()=>{
  const ui=setup({projects:[{id:'p1',title:'A'},{id:'p2',title:'B'}]});ui.run("adviceDraft.projectId='p2';openAdviceImport()");
  assert.equal(ui.run('editorContext.collection'),'reviews');assert.equal(ui.run('editorContext.record.projectId'),'p2');assert.equal(ui.node('editor-dialog').open,true);assert.match(ui.node('editor-content').innerHTML,/review-import-file/);assert.match(ui.node('editor-content').innerHTML,/Import advice manually/);assert.equal(ui.calls.length,0);
});

test('manual text files append as literal text and source notes, block saving during reads, and never run a model',async()=>{
  const ui=setup(),job=deferred();ui.setEditor();ui.node('field-assessment').value='Existing assessment';ui.node('field-notes').value='Existing note';
  const pending=ui.file({name:'advice.md',size:80,text:()=>job.promise});assert.equal(ui.node('save-record').disabled,true);assert.equal(ui.run('editorContext.importBusy'),true);
  await ui.run('saveRecord({preventDefault(){},target:{reportValidity(){throw new Error("must not submit during import")}}})');
  job.resolve('<script>never execute</script>\n# Research suggestions');await pending;
  assert.equal(ui.node('field-assessment').value,'Existing assessment\n\n<script>never execute</script>\n# Research suggestions');assert.equal(ui.node('field-notes').value,'Existing note\nManually imported file: advice.md');assert.equal(ui.node('save-record').disabled,false);assert.equal(ui.calls.length,0);
});

test('late file reads cannot write into another editor or a closed dialog',async()=>{
  for(const replaced of [false,true]){const ui=setup(),job=deferred();ui.setEditor();const pending=ui.file({name:'old.txt',size:10,text:()=>job.promise});if(replaced)ui.setEditor();else ui.node('editor-dialog').close();ui.node('field-assessment').value='New draft';job.resolve('Old file');await pending;assert.equal(ui.node('field-assessment').value,'New draft');assert.equal(ui.node('field-notes').value,'');}
});

test('invalid, oversized, unreadable and over-limit files leave the entire existing draft intact',async()=>{
  const cases=[{name:'advice.pdf',size:10,text:async()=>{throw new Error('should not read');}},{name:'advice.txt',size:120001,text:async()=>{throw new Error('should not read');}},{name:'advice.txt',size:0,text:async()=>''},{name:'advice.txt',size:20,text:async()=>{throw new Error('Read failed');}},{name:'advice.txt',size:20,text:async()=>String.fromCharCode(0)},{name:'advice.txt',size:30000,text:async()=>'a'.repeat(30000)},{name:'advice.txt',size:2,arrayBuffer:async()=>new Uint8Array([0xff,0xff]).buffer}];
  for(const file of cases){const ui=setup();ui.setEditor();ui.node('field-assessment').value='Existing';ui.node('field-notes').value='Keep source';await ui.file(file);assert.equal(ui.node('editor-error').hidden,false,file.name);assert.equal(ui.node('field-assessment').value,'Existing');assert.equal(ui.node('field-notes').value,'Keep source');assert.equal(ui.node('save-record').disabled,false);assert.equal(ui.calls.length,0);}
});
