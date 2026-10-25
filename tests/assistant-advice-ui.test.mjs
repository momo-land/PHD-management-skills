import test from 'node:test';
import assert from 'node:assert/strict';
import {assistantCopy,createAssistantWorkspace} from '../public/assistant.mjs';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const project={id:'project-a',title:'Research A'};
const chat=(id,extra={})=>({id,title:id,projectId:project.id,status:'idle',messages:[],pendingRequests:[],activity:[],...extra});

// In-memory DOM model only; these tests do not open a browser or run Codex.
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
const selectedTitle=container=>find(container,node=>node.className==='assistant-chat-title').children[0].textContent;
const inputOf=container=>find(container,node=>node.id==='assistant-message');

function setup({advice,language='en',existing=[]}={}){
  const calls=[],conversations=[...existing];
  const api=async(path,options={})=>{
    calls.push({path,...options});
    if(path==='/api/assistant/advice'){
      const result=await advice(options.body);
      if(result?.conversation && !conversations.some(item=>item.id===result.conversation.id))conversations.unshift(result.conversation);
      return result;
    }
    if(path==='/api/assistant/status')return {connected:true,loggedIn:true,authMode:'chatgpt'};
    if(path==='/api/assistant/conversations')return {conversations};
    const id=decodeURIComponent(path.split('/').at(-1));
    const conversation=conversations.find(item=>item.id===id);
    if(conversation)return {conversation};
    throw new Error(`Unexpected API call: ${path}`);
  };
  const workspace=createAssistantWorkspace({api,language,getProjects:()=>[project],getProjectId:()=>project.id});
  return {workspace,calls};
}

test('advice can start before the assistant is mounted and opens its new running chat',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();let workspace;
  try{
    const running=chat('New AI research advice',{status:'running'});
    const initialized=setup({advice:async()=>({conversation:running})});workspace=initialized.workspace;
    const result=await workspace.startAdvice({requestId:'advice-before-mount',projectId:project.id,focus:'Compare experiment options'});
    assert.equal(result,running);
    assert.deepEqual(initialized.calls.map(({path,method,body})=>({path,method,body})),[{
      path:'/api/assistant/advice',method:'POST',body:{requestId:'advice-before-mount',projectId:project.id,focus:'Compare experiment options',language:'en'},
    }],'the advice endpoint owns connecting, creating a new chat and starting generation');
    const container=document.createElement('main');container.connected=true;workspace.mount(container);await tick();
    assert.equal(selectedTitle(container),running.title);
    assert.equal(find(container,node=>node.className==='assistant-chat-state').textContent,'Working');
    assert.equal(inputOf(container).value,'');
  }finally{workspace?.unmount();await tick();globalThis.document=previous;}
});

test('starting advice preserves both a linked chat draft and the new-chat draft',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();let workspace;
  try{
    const linked=chat('original-linked-chat',{linkedSource:{threadId:'original-codex-id',syncedAt:'2026-10-25T00:00:00Z'}});
    const generated=chat('independent-advice-chat',{status:'running'});
    const initialized=setup({existing:[linked],advice:async()=>({conversation:generated})});workspace=initialized.workspace;
    const container=document.createElement('main');container.connected=true;workspace.mount(container);await tick();
    const input=inputOf(container);input.value='Draft for a future new chat';input.dispatch('input');
    find(container,node=>node.dataset.conversationId===linked.id).dispatch('click');await tick();
    input.value='Unsent message for the original linked chat';input.dispatch('input');
    await workspace.startAdvice({requestId:'separate-advice',projectId:project.id});await tick();
    assert.equal(selectedTitle(container),generated.title);assert.equal(input.value,'');
    assert.equal(find(container,node=>node.className==='assistant-linked').hidden,true);
    find(container,node=>node.dataset.conversationId===linked.id).dispatch('click');await tick();
    assert.equal(selectedTitle(container),linked.title);assert.equal(input.value,'Unsent message for the original linked chat');
    workspace.newConversation();assert.equal(input.value,'Draft for a future new chat');
    assert.equal(initialized.calls.some(({path})=>path.endsWith('/messages') || path.includes('/sources/')),false,'advice never resumes or sends to the currently selected chat');
  }finally{workspace?.unmount();await tick();globalThis.document=previous;}
});

test('repeated advice clicks share one pending operation and never automatically resend a successful request',async()=>{
  const pending=deferred();const {workspace,calls}=setup({advice:()=>pending.promise});
  const payload={requestId:'one-advice',projectId:project.id,focus:'Next steps'};
  const first=workspace.startAdvice(payload),second=workspace.startAdvice(payload);
  assert.equal(first,second);assert.equal(calls.length,1);
  pending.resolve({conversation:chat('one-new-advice',{status:'running'})});
  const generated=await first;assert.equal(await second,generated);
  assert.equal(await workspace.startAdvice(payload),generated);assert.equal(calls.length,1);
  await assert.rejects(workspace.startAdvice({...payload,projectId:'different-project'}),/different project or question/);
  await assert.rejects(workspace.startAdvice({...payload,focus:'Different question'}),/different project or question/);
  assert.equal(calls.length,1);
});

test('an unknown advice outcome keeps the selected draft and retries the original language and scope',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();let workspace;
  try{
    let language='en',attempts=0;
    const old=chat('existing-chat');const generated=chat('recovered-advice',{status:'running'});
    const initialized=setup({language:()=>language,existing:[old],advice:async()=>{
      if(++attempts===1)throw new Error('Reply was lost');
      return {conversation:generated};
    }});workspace=initialized.workspace;
    const container=document.createElement('main');container.connected=true;workspace.mount(container);await tick();
    find(container,node=>node.dataset.conversationId===old.id).dispatch('click');await tick();
    const input=inputOf(container);input.value='My existing unsent draft';input.dispatch('input');
    const payload={requestId:'retry-same-operation',projectId:project.id,focus:'Keep this exact scope'};
    await assert.rejects(workspace.startAdvice(payload),/Reply was lost/);
    assert.equal(selectedTitle(container),old.title);assert.equal(input.value,'My existing unsent draft');
    language='zh';const result=await workspace.startAdvice(payload);await tick();
    assert.equal(result.id,generated.id);assert.equal(selectedTitle(container),generated.title);
    const attemptsMade=initialized.calls.filter(({path})=>path==='/api/assistant/advice');
    assert.equal(attemptsMade.length,2);assert.deepEqual(attemptsMade[0].body,attemptsMade[1].body);
    assert.equal(attemptsMade[1].body.language,'en');
    find(container,node=>node.dataset.conversationId===old.id).dispatch('click');await tick();assert.equal(input.value,'My existing unsent draft');
  }finally{workspace?.unmount();await tick();globalThis.document=previous;}
});

test('a returned advice generation failure opens the new chat with its error, without resending',async()=>{
  const previous=globalThis.document;globalThis.document=modelDocument();let workspace;
  try{
    const failed=chat('advice-needs-attention',{status:'error',error:'Codex needs you to sign in.'});
    const initialized=setup({advice:async()=>({conversation:failed})});workspace=initialized.workspace;
    await workspace.startAdvice({requestId:'failed-generation',projectId:project.id});
    const container=document.createElement('main');container.connected=true;workspace.mount(container);await tick();
    assert.equal(selectedTitle(container),failed.title);
    assert.equal(find(container,node=>node.className==='assistant-chat-state').textContent,'Needs attention');
    const error=find(container,node=>node.className==='assistant-error');assert.equal(error.hidden,false);assert.match(error.textContent,/Codex needs you to sign in/);
    assert.equal(initialized.calls.filter(({path})=>path==='/api/assistant/advice').length,1);
  }finally{workspace?.unmount();await tick();globalThis.document=previous;}
});

test('only a missing advice route asks for a service restart, while project errors stay specific',async()=>{
  for(const language of ['zh','en']){
    for(const [status,code] of [[404,'NOT_FOUND'],[405,'METHOD_NOT_ALLOWED']]){
      const {workspace}=setup({language,advice:async()=>{throw Object.assign(new Error('Old route'),{status,code});}});
      await assert.rejects(workspace.startAdvice({requestId:'missing-advice-route',projectId:project.id}),error=>{
        assert.equal(error.message,assistantCopy(language).adviceUnavailable);assert.equal(error.code,'ASSISTANT_ADVICE_UNAVAILABLE');assert.equal(error.status,status);return true;
      });
    }
    const missingProject=Object.assign(new Error('The selected research project no longer exists.'),{status:404,code:'PROJECT_NOT_FOUND'});
    const {workspace}=setup({language,advice:async()=>{throw missingProject;}});
    await assert.rejects(workspace.startAdvice({requestId:'missing-project',projectId:project.id}),error=>error===missingProject);
  }
});
