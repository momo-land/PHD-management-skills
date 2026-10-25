import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOURCE_THREAD_LIMIT,sourceImportCopy,sourceImportError,createSourceImportController,createSourceImportDialog} from '../public/assistant-sources.mjs';
import {createAssistantWorkspace} from '../public/assistant.mjs';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {resolve,reject,promise};};
const row=(id,cwd='/research/a')=>({id,title:`Chat ${id}`,cwd,updatedAt:'2026-10-25T00:00:00Z'});
const preview=(id='preview-1')=>({id,text:'User: completed an actual pilot\nAssistant: needs evidence',messageCount:2,sources:[{...row('one'),messageCount:2,truncated:false}],truncated:false});
const project={id:'research-a',title:'Research A'};
const responseError=(code,status=409)=>Object.assign(new Error(code),{code,status});

function setup({handler,projects=[project],language='en'}={}){
  const calls=[],imported=[];
  const api=async(path,options)=>{calls.push({path,...options});if(handler)return handler(path,options,calls);if(path.endsWith('/list'))return {threads:[row('one'),row('two')],nextCursor:null,projects:[{cwd:'/research/a',title:'a'}]};if(path.endsWith('/preview'))return {preview:preview()};return {conversation:{id:'new-import',status:'running',projectId:options.body.projectId}};};
  const controller=createSourceImportController({api,language,getProjects:()=>projects,onImported:item=>imported.push(item)});
  return {controller,calls,imported};
}
async function ready(controller){controller.open(project.id);await tick();controller.select('one',true);await controller.preview();}

test('source importer is lazy, selections survive filters, pagination keeps filter context and deduplicates',async()=>{
  const {controller:c,calls}=setup({handler:async(path,{body})=>{
    assert.ok(path.endsWith('/list'));
    return body.cursor?{threads:[row('two'),row('three')],nextCursor:null,projects:[{cwd:'/research/b',title:'b'}]}:{threads:[row('one'),row('two')],nextCursor:'opaque-page',projects:[{cwd:'/research/a',title:'a'}]};
  }});
  assert.equal(calls.length,0,'creating the assistant never reads existing source chats');
  c.open();await tick();c.select('one',true);
  await c.list({filters:{search:'  experiment  ',cwd:' /research/b ',archived:true}});
  assert.deepEqual(c.state.selected.map(item=>item.id),['one']);
  await c.list({more:true});
  assert.deepEqual(calls.at(-1).body,{search:'experiment',cwd:'/research/b',archived:true,cursor:'opaque-page'});
  assert.deepEqual(c.state.threads.map(item=>item.id),['one','two','three']);
  assert.equal(c.state.projects.length,2);
  assert.equal(calls.some(call=>!call.path.endsWith('/list')),false,'listing never reads bodies or runs a model');
});

test('source selection is capped at five and preview/import require explicit choices',async()=>{
  const {controller:c,calls,imported}=setup({handler:async(path,{body})=>path.endsWith('/list')?{threads:Array.from({length:8},(_,i)=>row(String(i))),nextCursor:null}:path.endsWith('/preview')?{preview:preview()}:{conversation:{id:'new-chat',status:'running',projectId:body.projectId}}});
  c.open();await tick();await c.preview();assert.match(c.state.error,/Select at least/);assert.equal(calls.length,1);
  c.selectLoaded();assert.equal(c.state.selected.length,SOURCE_THREAD_LIMIT);
  c.select('6',true);assert.equal(c.state.selected.length,5);assert.match(c.state.error,/up to 5/);
  await c.preview();assert.equal(calls.at(-1).body.threadIds.length,5);assert.equal(imported.length,0);
  await c.importPreview();assert.match(c.state.error,/Choose an available/);assert.equal(imported.length,0);
  c.setProject(project.id);await c.importPreview();assert.equal(imported[0].id,'new-chat');assert.equal(c.state.open,false);
});

test('cancel aborts a read and ignores its late reply without losing previous selections',async()=>{
  const job=deferred();let count=0;
  const {controller:c,calls}=setup({handler:async()=>++count===1?{threads:[row('one')],nextCursor:null}:job.promise});
  c.open();await tick();c.select('one',true);const pending=c.preview();assert.equal(c.state.busy,'preview');
  c.close();assert.equal(calls.at(-1).signal.aborted,true);assert.equal(c.state.open,false);
  job.resolve({preview:preview()});await pending;
  assert.equal(c.state.preview,null);assert.deepEqual(c.state.selected.map(item=>item.id),['one']);
  c.open();assert.equal(calls.length,2,'reopening preserves the loaded choices');c.close();
});

test('a superseded search cannot replace newer list results',async()=>{
  const job=deferred();let requests=0;
  const {controller:c}=setup({handler:async()=>++requests===1?job.promise:{threads:[row('fresh')],nextCursor:null}});
  c.open();await c.list({filters:{search:'fresh'}});job.resolve({threads:[row('stale')],nextCursor:null});await tick();
  assert.deepEqual(c.state.threads.map(item=>item.id),['fresh']);c.close();
});

test('expired list cursors restart pagination and expired source choices must be selected again',async()=>{
  let phase=0;
  const {controller:c,calls}=setup({handler:async(path,{body})=>{
    if(path.endsWith('/preview'))throw responseError('SOURCE_NOT_LISTED');
    if(body.cursor && phase++===0)throw responseError('SOURCE_LIST_EXPIRED');
    return {threads:[row('one')],nextCursor:'next'};
  }});
  c.open();await tick();await c.list({more:true});assert.match(c.state.error,/list expired/);await c.state.retry();assert.equal(calls.at(-1).body.cursor,undefined);
  c.select('one',true);await c.preview();assert.equal(c.state.selected.length,0);await c.state.retry();assert.ok(calls.at(-1).path.endsWith('/list'));
});

test('expired preview can be reread, empty source text is not presented as imported progress',async()=>{
  let imports=0,empty=false;
  const {controller:c,imported}=setup({handler:async(path)=>{
    if(path.endsWith('/list'))return {threads:[row('one')],nextCursor:null};
    if(path.endsWith('/preview'))return {preview:{...preview(),messageCount:empty?0:2}};
    if(imports++===0)throw responseError('SOURCE_PREVIEW_EXPIRED');
    return {conversation:{id:'new-chat'}};
  }});
  await ready(c);await c.importPreview();assert.match(c.state.error,/preview expired/);assert.equal(imported.length,0);await c.state.retry();assert.equal(c.state.error,'');
  c.back();empty=true;await c.preview();assert.equal(c.state.preview,null);assert.match(c.state.error,/no text messages/);
});

test('lost import reply freezes token, project and language through close/reopen and language changes',async()=>{
  let language='en',imports=0;
  const {controller:c,calls,imported}=setup({language:()=>language,projects:[project,{id:'research-b',title:'B'}],handler:async(path,{body})=>{
    if(path.endsWith('/list'))return {threads:[row('one')],nextCursor:null};
    if(path.endsWith('/preview'))return {preview:preview()};
    if(imports++===0)throw new Error('Lost response');
    return {conversation:{id:'original-chat',projectId:body.projectId}};
  }});
  await ready(c);await c.importPreview();assert.equal(c.state.uncertain,true);
  c.setProject('research-b');c.back();c.clear();await c.preview();await c.list();
  assert.equal(c.state.projectId,project.id);assert.equal(c.state.preview.id,'preview-1');assert.equal(calls.length,3);
  c.close();language='zh';c.open('research-b');await c.state.retry();
  const writes=calls.filter(call=>call.path.endsWith('/import'));
  assert.deepEqual(writes.map(call=>call.body),Array(2).fill({previewId:'preview-1',projectId:project.id,language:'en'}));
  assert.equal(imported[0].id,'original-chat');assert.equal(c.state.uncertain,false);
});

test('an in-flight import is submitted once and cannot be canceled into an ambiguous retry',async()=>{
  const job=deferred();
  const {controller:c,calls}=setup({handler:async(path)=>path.endsWith('/list')?{threads:[row('one')]}:path.endsWith('/preview')?{preview:preview()}:job.promise});
  await ready(c);const operation=c.importPreview();assert.equal(c.close(),false);await c.importPreview();
  assert.equal(calls.filter(item=>item.path.endsWith('/import')).length,1);
  job.resolve({conversation:{id:'imported',status:'running'}});await operation;assert.equal(c.state.open,false);
});

test('complete bilingual copy and useful error categories do not imply original chats are modified',()=>{
  const zh=sourceImportCopy('zh'),en=sourceImportCopy('en');assert.deepEqual(Object.keys(zh).sort(),Object.keys(en).sort());
  for(const value of Object.values(en)){assert.equal(typeof value,'string');assert.doesNotMatch(value,/[\u3400-\u9fff]/);}
  assert.equal(sourceImportError(responseError('SOURCE_PREVIEW_EXPIRED'),'en','import'),en.expired);
  assert.equal(sourceImportError(responseError('SOURCE_READ_UNAVAILABLE',501),'en'),en.unavailable);
  assert.equal(sourceImportError(responseError('CODEX_NOT_LOGGED_IN',401),'en'),en.connect);
  assert.equal(sourceImportError(responseError('CODEX_LIMIT',429),'en','import'),en.busy);
  assert.match(en.privacy,/sends the displayed material/);assert.match(en.truncated,/earlier content/);assert.match(en.cwdHelp,/loaded directories only/);
  const source=readFileSync(new URL('../public/assistant-sources.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\.innerHTML\s*=|insertAdjacentHTML\s*\(|localStorage|sessionStorage|\.dataset\.action\s*=/);
});

// Minimal DOM model: no browser, renderer, network or layout engine is launched.
class ModelElement {
  constructor(tag,document){this.tagName=tag;this.document=document;this.children=[];this.parentNode=null;this.attributes={};this.dataset={};this.handlers={};this.hidden=false;this.disabled=false;this.value='';this._text='';this.connected=false;this.scrollHeight=0;this.scrollTop=0;this.clientHeight=0;this.classList={toggle:()=>{}};}
  get isConnected(){return this.connected || Boolean(this.parentNode?.isConnected);}
  set textContent(text){this._text=String(text);for(const node of this.children)node.parentNode=null;this.children=[];}
  get textContent(){return this._text+this.children.map(item=>item.textContent).join('');}
  append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
  remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(item=>item!==this);this.parentNode=null;}}
  insertBefore(node,reference){node.remove();node.parentNode=this;const index=this.children.indexOf(reference);if(index<0)this.children.push(node);else this.children.splice(index,0,node);}
  replaceChildren(...nodes){for(const node of this.children)node.parentNode=null;this.children=[];this._text='';this.append(...nodes);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  addEventListener(name,callback){(this.handlers[name] ||= []).push(callback);}
  dispatch(name){if(this.disabled)return;for(const callback of this.handlers[name] || [])callback({preventDefault(){},target:this});}
  querySelectorAll(selector){const match=item=>selector.split(',').some(tag=>tag.startsWith('[data-')?Object.hasOwn(item.dataset,tag.slice(6,-1).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())):item.tagName===tag);return this.children.flatMap(item=>[...(match(item)?[item]:[]),...item.querySelectorAll(selector)]);}
  focus(){this.document.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;}
}
function modelDocument(){const doc={activeElement:null};doc.createElement=tag=>new ModelElement(tag,doc);return doc;}
function find(root,predicate){if(predicate(root))return root;for(const child of root.children){const result=find(child,predicate);if(result)return result;}return null;}

test('dialog renders hostile source text literally, keeps keyboard focus and guides an empty workspace to projects',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();
  try{
    const calls=[];const hostile='<img src=x onerror=alert(1)>';
    const api=async(path,options)=>{calls.push({path,options});return path.endsWith('/list')?{threads:[{...row('one'),title:hostile}],nextCursor:null,projects:[]}:{preview:{...preview(),text:hostile,truncated:true,sources:[{...row('one'),messageCount:2,truncated:true}]}};};
    const importer=createSourceImportDialog({api,language:'en',getProjects:()=>[]});importer.element.connected=true;
    assert.equal(calls.length,0);importer.open();await tick();
    const checkbox=find(importer.element,node=>node.dataset.sourceId==='one');checkbox.focus();checkbox.checked=true;checkbox.dispatch('change');
    assert.equal(document.activeElement,checkbox);assert.equal(checkbox.parentNode!==null,true,'selection does not replace the focused checkbox');
    assert.equal(find(importer.element,node=>node.tagName==='img'),null);
    find(importer.element,node=>node.tagName==='button' && node.textContent==='Review selected text').dispatch('click');await tick();
    assert.equal(find(importer.element,node=>node.tagName==='pre').textContent,hostile);
    assert.equal(find(importer.element,node=>node.tagName==='button' && node.textContent==='Organize and import').disabled,true);
    const link=find(importer.element,node=>node.tagName==='a');assert.equal(link.href,'#projects');assert.match(link.parentNode.textContent,/New project/);
    assert.match(find(importer.element,node=>node.className==='assistant-source-summary').textContent,/2 text messages · partial content/);
    assert.equal(find(importer.element,node=>node.className==='assistant-source-warning').hidden,false);
    link.dispatch('click');assert.equal(importer.element.open,false);
  }finally{globalThis.document=previous;}
});

test('successful source import opens a separate chat and preserves the current chat and new-chat drafts',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();let workspace;
  try{
    let imported=false;
    const oldChat={id:'existing-chat',title:'Existing research chat',status:'idle',projectId:project.id,messages:[],pendingRequests:[],activity:[]};
    const newChat={id:'imported-chat',title:'Imported research progress',status:'running',projectId:project.id,messages:[],pendingRequests:[],activity:[]};
    const calls=[];const api=async(path,options={})=>{
      calls.push(path);
      if(path.endsWith('/sources/list'))return {threads:[row('one')],nextCursor:null};
      if(path.endsWith('/sources/preview'))return {preview:preview()};
      if(path.endsWith('/sources/import')){imported=true;return {conversation:newChat};}
      if(path==='/api/assistant/status')return {connected:true,loggedIn:true,authMode:'chatgpt'};
      if(path==='/api/assistant/conversations')return {conversations:imported?[newChat,oldChat]:[oldChat]};
      if(path.endsWith('/existing-chat'))return {conversation:oldChat};
      if(path.endsWith('/imported-chat'))return {conversation:newChat};
      throw new Error(`Unexpected path ${path}`);
    };
    workspace=createAssistantWorkspace({api,language:'en',getProjects:()=>[project],getProjectId:()=>project.id});
    const container=document.createElement('main');container.connected=true;workspace.mount(container);await tick();
    assert.equal(calls.some(path=>path.includes('/sources/')),false);
    const input=find(container,node=>node.id==='assistant-message');input.value='Unsent new-chat material';input.dispatch('input');
    find(container,node=>node.dataset.conversationId==='existing-chat').dispatch('click');await tick();
    input.value='Unsent current-chat material';input.dispatch('input');
    find(container,node=>node.tagName==='button' && node.textContent==='Import from Codex').dispatch('click');await tick();
    find(container,node=>node.tagName==='button' && node.textContent==='Cancel').dispatch('click');
    assert.equal(input.value,'Unsent current-chat material','cancel does not alter the chat draft');
    find(container,node=>node.tagName==='button' && node.textContent==='Import from Codex').dispatch('click');
    const check=find(container,node=>node.dataset.sourceId==='one');check.checked=true;check.dispatch('change');
    find(container,node=>node.tagName==='button' && node.textContent==='Review selected text').dispatch('click');await tick();
    find(container,node=>node.tagName==='button' && node.textContent==='Organize and import').dispatch('click');await tick();
    assert.equal(input.value,'','a new import chat starts with its own draft');
    assert.equal(find(container,node=>node.className==='assistant-chat-title').children[0].textContent,newChat.title);
    find(container,node=>node.dataset.conversationId==='existing-chat').dispatch('click');await tick();
    assert.equal(input.value,'Unsent current-chat material');
    find(container,node=>node.tagName==='button' && node.textContent==='New chat').dispatch('click');
    assert.equal(input.value,'Unsent new-chat material');
  }finally{workspace?.unmount();globalThis.document=previous;}
});
