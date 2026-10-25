// Existing Codex chats are read only after the user opens this picker.
export const SOURCE_THREAD_LIMIT = 5;
const languageCode = value => value === 'en' ? 'en' : 'zh';
const strings = {
  zh: {
    open:'从 Codex 导入', title:'使用已有 Codex 对话', close:'取消', closeImport:'正在开始导入…',
    description:'选择一个原对话继续聊，或把多段对话整理成科研进度。',
    modeLabel:'使用方式', linkMode:'关联原对话', importMode:'只导入进度', linkHint:'选择 1 个对话。关联后，两边继续使用同一个 Codex 对话。',
    linkReviewStep:'2 · 查看原文并关联', linkUse:'关联并继续对话', linking:'正在关联对话…', linkTarget:'关联哪个科研课题',
    linkBehavior:'关联后可在这里继续原对话，新消息会定期同步。同一时间请只用一个窗口发送；若原对话被占用，先停止原对话，切换后仍被占用时需退出 Codex 桌面应用。用“一键更新”保存科研进度，关联本身不会修改科研记录。',
    linkPrivacy:'列表、预览和关联仅在本机处理，不调用模型。之后点击“发送”会在原 Codex 对话中执行，需要联网并计入账号额度。',
    linkTruncated:'这里只预览最近的部分文字；长消息可能被截短。关联后仍使用原 Codex 对话的上下文，网页只展示近期文字消息。',
    linkUncertain:'尚未确认关联是否完成。请点击重试，系统会沿用同一预览，避免重复关联。',
    readUnavailable:'工作台连接的 Codex 暂不支持读取这个对话，可能与对话历史格式有关。请检查实际使用的 Codex CLI 路径和版本；它可能与桌面应用不同。也可以粘贴需要的文字。',
    readFailed:'Codex 未能读取这个对话。请先在 Codex 中确认对话能打开，再重新连接并重试；这不一定是版本问题。',
    methodUnsupported:'工作台连接的 Codex 不支持这项操作。请检查实际使用的 Codex CLI 路径和版本；它可能与桌面应用不同。',
    responseTooLarge:'Codex 返回的内容超过单次读取上限，连接已停止。请重新连接并选择较短的对话，或粘贴需要的文字。',
    chooseStep:'1 · 选择来源', previewStep:'2 · 查看原文并导入', search:'搜索对话标题', searchPlaceholder:'输入标题关键词',
    cwd:'来源项目目录（可选）', cwdPlaceholder:'选择已加载目录，或输入完整目录', cwdHelp:'这里按对话的本机目录分组。候选项只包含已加载的目录，不是 Codex 侧栏的完整项目列表。',
    archived:'查看已归档对话', filter:'筛选', refresh:'刷新列表', clear:'清空选择', selectLoaded:'选择已显示对话（最多 5 个）',
    selected:'已选择', selectHint:'每次最多选择 5 个对话；切换筛选后，已选对话仍会保留。', limit:'一次最多选择 5 个对话。请先取消一些已选项。',
    loading:'正在读取本机 Codex 对话…', loadingPreview:'正在读取所选对话的原文…', empty:'没有找到对话。可以更换标题、目录或归档筛选。',
    more:'加载更多', allLoaded:'当前筛选的对话已加载完毕。', untitled:'未命名对话', noCwd:'未记录项目目录', unknownDate:'更新时间未知',
    preview:'查看所选原文', back:'返回选择', original:'所选对话原文', previewHelp:'以下是用户与 AI 的文字消息，不是已核验的科研成果。附件、图片和工具日志不在预览中。预览不调用模型。',
    truncated:'原文较长，当前只包含最近的部分文字，长消息也可能被截短。导入仅使用下方显示的内容。早期内容可先在 Codex 中整理，再通过“导入材料”补充。',
    expiry:'预览有时效；如果过期，请重新读取原文。', target:'保存到哪个科研课题', chooseTarget:'请选择目标科研课题',
    noProjects:'你还没有科研课题。请先去“课题管理”，点击“新建课题”，然后回到这里继续。', projects:'去课题管理',
    use:'开始整理并导入', importing:'正在建立导入对话…', privacy:'列表与预览仅在本机读取。点击“开始整理并导入”后，所示材料会交给已登录的 Codex 处理，需要联网并计入账号额度。',
    behavior:'导入会新建一个网站对话。Codex 会核对已有记录，保存明确进展；遇到歧义会在新对话中向你确认。',
    retry:'重试', noSelection:'请先选择至少一个对话。', noText:'所选对话没有可导入的文字消息。', targetRequired:'请先选择一个有效的科研课题。',
    network:'暂时无法读取本地服务，请检查工作台仍在运行后重试。', unavailable:'当前工作台服务没有提供这个功能。请重新启动工作台服务并刷新页面。',
    expired:'预览已过期或服务已重启。请重新读取所选原文后再导入。', sourceMissing:'有来源对话已不可用。请返回列表刷新并重新选择。',
    connect:'请先连接并登录电脑上的 Codex，再重试。', busy:'已有多个对话正在运行。请等一个完成后重试，已选材料会保留。',
    uncertain:'尚未确认导入是否启动。请使用下方重试按钮，系统会沿用同一预览，避免重复创建对话。',
    remove:'取消选择', readAgain:'重新读取原文', count:'个对话', messages:'条文字消息', partial:'部分内容', listExpired:'列表已过期或筛选已改变，请刷新列表后继续。',
  },
  en: {
    open:'Import from Codex', title:'Use an existing Codex chat', close:'Cancel', closeImport:'Starting import…',
    description:'Continue an existing chat, or organize several chats into research progress.',
    modeLabel:'How to use the chat', linkMode:'Link original chat', importMode:'Import progress only', linkHint:'Choose 1 chat. Linking lets both places continue the same Codex chat.',
    linkReviewStep:'2 · Review and link', linkUse:'Link and continue chatting', linking:'Linking chat…', linkTarget:'Research project for this chat',
    linkBehavior:'Continue the original chat here, with new messages synced regularly. Send from one window at a time. If Codex still owns the chat, stop it; if switching away does not release it, quit the Codex desktop app. Use “Update progress” to save research records. Linking alone does not change them.',
    linkPrivacy:'Listing, previewing and linking happen locally without running a model. Later, Send runs your request in the original Codex chat. Internet access and account usage limits apply.',
    linkTruncated:'This preview shows only recent text, and long messages may be shortened. Linking retains the original Codex chat context; this page displays recent text messages.',
    linkUncertain:'Linking has not been confirmed. Retry to reuse the same preview and avoid a duplicate link.',
    readUnavailable:'The Codex connected to this workspace does not support reading this chat, possibly because of its history format. Check the Codex CLI path and version in use; it may differ from the desktop app. You can also paste the needed text.',
    readFailed:'Codex could not read this chat. Check that it opens in Codex, then reconnect and retry; this does not necessarily mean a version problem.',
    methodUnsupported:'The Codex connected to this workspace does not support this operation. Check the Codex CLI path and version in use; it may differ from the desktop app.',
    responseTooLarge:'Codex returned more content than can be read in one response, so the connection was stopped. Reconnect and choose a shorter chat, or paste the needed text.',
    chooseStep:'1 · Choose sources', previewStep:'2 · Review and import', search:'Search chat titles', searchPlaceholder:'Enter words from the title',
    cwd:'Source project directory (optional)', cwdPlaceholder:'Choose a loaded directory, or enter its full path', cwdHelp:'Chats are grouped by their local directory. Suggestions include loaded directories only, not the full Codex sidebar project list.',
    archived:'Show archived chats', filter:'Filter', refresh:'Refresh list', clear:'Clear selection', selectLoaded:'Select displayed chats (up to 5)',
    selected:'Selected', selectHint:'Choose up to 5 chats at a time. Selected chats remain selected when filters change.', limit:'Choose up to 5 chats at a time. Remove a selected chat first.',
    loading:'Reading local Codex chats…', loadingPreview:'Reading text from the selected chats…', empty:'No chats found. Try a different title, directory or archive filter.',
    more:'Load more', allLoaded:'All chats matching this filter are loaded.', untitled:'Untitled chat', noCwd:'No project directory recorded', unknownDate:'Update time unavailable',
    preview:'Review selected text', back:'Back to selection', original:'Original chat text', previewHelp:'These are user and AI text messages, not verified research findings. Attachments, images and tool logs are excluded. Preview does not run a model.',
    truncated:'Only part of the recent text is included, and long messages may be shortened. Import uses only the text shown below. You can organize earlier content in Codex and add it with “Import material”.',
    expiry:'Previews expire. Read the source text again if this preview expires.', target:'Research project to update', chooseTarget:'Choose a target research project',
    noProjects:'You have no research projects yet. Go to “Manage projects”, choose “New project”, then return here to continue.', projects:'Manage projects',
    use:'Organize and import', importing:'Creating an import chat…', privacy:'Lists and previews are read locally. “Organize and import” sends the displayed material to your signed-in Codex. Internet access and account usage limits apply.',
    behavior:'Import creates a new website chat. Codex checks existing records and saves clear progress. It asks about ambiguous items in the new chat.',
    retry:'Retry', noSelection:'Select at least one chat first.', noText:'The selected chats have no text messages to import.', targetRequired:'Choose an available research project first.',
    network:'The local service could not be reached. Check that the workspace is running, then retry.', unavailable:'This workspace service does not provide this feature. Restart the workspace service and refresh the page.',
    expired:'The preview expired or the service restarted. Read the selected source text again before importing.', sourceMissing:'A source chat is no longer available. Return to the list, refresh and select again.',
    connect:'Connect and sign in to local Codex, then retry.', busy:'Several chats are running. Wait for one to finish, then retry. Your selection is kept.',
    uncertain:'Import has not been confirmed. Use Retry below to reuse the same preview and avoid creating a duplicate chat.',
    remove:'Remove selection', readAgain:'Read source text again', count:'chats', messages:'text messages', partial:'partial content', listExpired:'The list expired or its filters changed. Refresh the list to continue.',
  },
};
export function sourceImportCopy(language='zh') { return strings[languageCode(language)]; }
export function sourceImportError(error, language='zh', operation='list') {
  const w=sourceImportCopy(language), code=String(error?.code || '');
  if(code==='SOURCE_LIST_EXPIRED')return w.listExpired;
  if(/EXPIRED|PREVIEW_NOT_FOUND/.test(code))return w.expired;
  if(/SOURCE.*NOT_FOUND|SOURCE_NOT_LISTED|THREAD_NOT_FOUND/.test(code))return w.sourceMissing;
  if(/NOT_LOGGED|CHATGPT_REQUIRED|NOT_CONNECTED/.test(code))return w.connect;
  const readErrors={SOURCE_READ_UNAVAILABLE:'readUnavailable',SOURCE_READ_FAILED:'readFailed',CODEX_METHOD_UNSUPPORTED:'methodUnsupported',CODEX_RESPONSE_TOO_LARGE:'responseTooLarge'};
  if(readErrors[code])return error?.message && error.message!==code?error.message:w[readErrors[code]];
  if(/LIMIT|BUSY/.test(code) && ['import','link'].includes(operation))return error?.message && error.message!==code?error.message:w.busy;
  if(code==='METHOD_NOT_FOUND' || [404,405,501].includes(error?.status))return w.unavailable;
  if(['import','link'].includes(operation) && (error?.name==='AbortError' || !error?.status))return operation==='link'?w.linkUncertain:w.uncertain;
  return error?.message || w.network;
}

// This controller has no DOM or storage access. Tests exercise real async transitions.
export function createSourceImportController({api,language='zh',getProjects=()=>[],onChange=()=>{},onImported=()=>{}}={}) {
  if(typeof api!=='function')throw new TypeError('Source import requires an api function.');
  const state={open:false,mode:'link',loaded:false,threads:[],projects:[],nextCursor:null,selected:[],filters:{search:'',cwd:'',archived:false},preview:null,projectId:'',busy:'',error:'',retry:null,uncertain:false};
  let version=0,controller=null,submission=null;
  const lang=()=>languageCode(typeof language==='function'?language():language);
  const w=()=>sourceImportCopy(lang());
  const submitting=()=>['import','link'].includes(state.busy);
  const change=()=>onChange(state);
  const invalidate=()=>{version++;controller?.abort();controller=null;state.busy='';};
  const request=async(operation,body)=>{
    controller=new AbortController();const signal=controller.signal;
    const timer=setTimeout(()=>controller?.signal===signal && controller.abort(),90000);
    try{return await api(`/api/assistant/sources/${operation}`,{method:'POST',body,signal});}
    finally{clearTimeout(timer);if(controller?.signal===signal)controller=null;}
  };
  function select(id,checked) {
    if(state.busy || state.uncertain)return;
    if(!checked){state.selected=state.selected.filter(item=>item.id!==id);state.error='';}
    else if(!state.selected.some(item=>item.id===id)){
      if(state.mode==='import' && state.selected.length>=SOURCE_THREAD_LIMIT){state.error=w().limit;state.retry=null;change();return;}
      const item=state.threads.find(item=>item.id===id);if(item)state.selected=state.mode==='link'?[item]:[...state.selected,item];
    }
    state.preview=null;change();
  }
  async function list({more=false,filters=state.filters}={}) {
    if(submitting() || state.uncertain || !state.open)return;
    invalidate();const stamp=version;state.busy='list';state.error='';state.retry=null;state.preview=null;
    if(!more){state.filters={search:String(filters.search || '').trim(),cwd:String(filters.cwd || '').trim(),archived:Boolean(filters.archived)};state.threads=[];state.nextCursor=null;}
    const cursor=more?state.nextCursor:null;if(more && !cursor){state.busy='';change();return;}
    change();
    try{
      const result=await request('list',{...state.filters,...(cursor?{cursor}:{})});
      if(stamp!==version || !state.open)return;
      const rows=Array.isArray(result.threads)?result.threads.filter(item=>typeof item?.id==='string'):[];
      state.threads=[...new Map([...state.threads,...rows].map(item=>[item.id,item])).values()];
      state.projects=[...new Map([...state.projects,...(Array.isArray(result.projects)?result.projects:[])].filter(item=>typeof item?.cwd==='string'&&item.cwd).map(item=>[item.cwd,item])).values()];
      state.nextCursor=result.nextCursor || null;state.loaded=true;
    }catch(error){if(stamp===version && state.open){state.error=sourceImportError(error,lang(),'list');state.retry=()=>list({more:error?.code==='SOURCE_LIST_EXPIRED'?false:more,filters:state.filters});}}
    finally{if(stamp===version){state.busy='';change();}}
  }
  async function preview() {
    if(state.busy || state.uncertain || !state.open)return;
    if(!state.selected.length){state.error=w().noSelection;change();return;}
    invalidate();const stamp=version;state.busy='preview';state.error='';state.retry=null;change();
    try{
      const result=await request('preview',{threadIds:state.selected.map(item=>item.id)});
      if(stamp!==version || !state.open)return;
      if(!result.preview?.id || result.preview.messageCount===0 || !result.preview?.text?.trim())throw new Error(w().noText);
      state.preview=result.preview;
    }catch(error){if(stamp===version && state.open){
      state.error=sourceImportError(error,lang(),'preview');
      if(error?.code==='SOURCE_NOT_LISTED'){state.selected=[];state.preview=null;state.retry=()=>list();}
      else state.retry=preview;
    }}
    finally{if(stamp===version){state.busy='';change();}}
  }
  async function importPreview() {
    if(state.busy || !state.open || !state.preview)return;
    if(!submission && !(getProjects() || []).some(item=>item.id===state.projectId)){state.error=w().targetRequired;change();return;}
    // A lost response must be retried with the exact same token, target and language.
    submission ||= {operation:state.mode,body:{previewId:state.preview.id,projectId:state.projectId,language:lang()}};
    const operation=submission.operation;
    const stamp=++version;state.busy=operation;state.error='';state.retry=null;change();
    try{
      const result=await request(operation,{...submission.body});
      if(!result.conversation?.id)throw new Error(operation==='link'?w().linkUncertain:w().uncertain);
      state.open=false;state.preview=null;state.selected=[];state.uncertain=false;submission=null;
      onImported(result.conversation);
    }catch(error){
      if(stamp===version){
        state.uncertain=!error?.status || error.status>=500 && error.status!==501;
        if(!state.uncertain)submission=null;
        state.error=state.uncertain?(operation==='link'?w().linkUncertain:w().uncertain):sourceImportError(error,lang(),operation);
        state.retry=/EXPIRED|PREVIEW_NOT_FOUND/.test(String(error?.code))?preview:importPreview;
      }
    }finally{if(stamp===version){state.busy='';change();}}
  }
  return {
    state,select,list,preview,importPreview,
    setMode(mode) {if(state.busy || state.uncertain || !['link','import'].includes(mode) || mode===state.mode)return;state.mode=mode;if(mode==='link')state.selected=state.selected.slice(0,1);state.preview=null;state.error='';state.retry=null;change();},
    open(projectId='') {state.open=true;if(!state.uncertain)state.projectId=(getProjects() || []).some(item=>item.id===state.projectId)?state.projectId:(getProjects() || []).some(item=>item.id===projectId)?projectId:'';change();if(!state.loaded && !state.busy)void list();},
    close() {if(submitting())return false;invalidate();state.open=false;change();return true;},
    back() {if(state.busy || state.uncertain)return;state.preview=null;state.error='';state.retry=null;change();},
    clear() {if(state.busy || state.uncertain)return;state.selected=[];state.preview=null;state.error='';state.retry=null;change();},
    selectLoaded() {if(state.busy || state.uncertain || state.mode==='link')return;for(const item of state.threads){if(state.selected.length>=SOURCE_THREAD_LIMIT)break;if(!state.selected.some(row=>row.id===item.id))state.selected.push(item);}state.error='';state.preview=null;change();},
    setProject(id) {if(submitting() || state.uncertain)return;state.projectId=id;state.error='';change();},
  };
}

function element(tag,className='',text) {
  const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=String(text);return node;
}
function button(text,handler,className='button button-secondary') {const node=element('button',className,text);node.type='button';node.addEventListener('click',handler);return node;}

export function createSourceImportDialog({api,language='zh',getProjects=()=>[],onImported=()=>{}}={}) {
  const lang=()=>languageCode(typeof language==='function'?language():language), copy=()=>sourceImportCopy(lang());
  const dialog=element('dialog','assistant-source-dialog');dialog.setAttribute('aria-labelledby','assistant-source-title');
  const labels=[],l=(node,key)=>{labels.push([node,key]);return node;};
  const heading=element('header','assistant-source-heading'), title=l(element('h2'),'title');title.id='assistant-source-title';
  const close=l(button('',()=>controller.close()),'close');
  heading.append(title,close);dialog.append(heading,l(element('p','assistant-source-description'),'description'));
  const modes=element('div','assistant-source-modes');modes.setAttribute('role','group');
  const linkMode=l(button('',()=>controller.setMode('link'),'assistant-source-mode'),'linkMode');
  const importMode=l(button('',()=>controller.setMode('import'),'assistant-source-mode'),'importMode');
  modes.append(linkMode,importMode);dialog.append(modes);
  const step=element('h3','assistant-source-step');dialog.append(step);
  const choice=element('section','assistant-source-choice'), form=element('form','assistant-source-filters');
  const search=element('input');search.type='search';search.id='assistant-source-search';search.maxLength=200;
  const cwd=element('input');cwd.type='text';cwd.id='assistant-source-cwd';cwd.maxLength=4096;cwd.setAttribute('list','assistant-source-directories');
  const directories=element('datalist');directories.id='assistant-source-directories';
  for(const [input,key] of [[search,'search'],[cwd,'cwd']]){const field=element('div','assistant-source-field'),label=l(element('label'),key);label.htmlFor=input.id;field.append(label,input);form.append(field);}
  const archived=element('input');archived.type='checkbox';const archiveLabel=l(element('span'),'archived'),archiveWrap=element('label','assistant-source-archived');archiveWrap.append(archived,archiveLabel);
  const filter=l(element('button','button button-secondary'),'filter');filter.type='submit';form.append(archiveWrap,filter,directories);
  form.addEventListener('submit',event=>{event.preventDefault();void controller.list({filters:{search:search.value,cwd:cwd.value,archived:archived.checked}});});
  const controls=element('div','assistant-source-list-controls');
  const selectLoaded=l(button('',()=>controller.selectLoaded()),'selectLoaded'),refresh=l(button('',()=>controller.list()),'refresh');controls.append(selectLoaded,refresh);
  const threads=element('div','assistant-source-threads');threads.setAttribute('aria-label',copy().chooseStep);
  const empty=l(element('p','assistant-source-empty'),'empty'),more=l(button('',()=>controller.list({more:true})),'more'),done=l(element('p','assistant-source-hint'),'allLoaded');
  choice.append(form,l(element('p','assistant-source-hint'),'cwdHelp'),controls,threads,empty,more,done);
  const selectedWrap=element('section','assistant-source-selection'),selectedHeading=element('div','assistant-source-list-controls');
  const count=element('strong'),clear=l(button('',()=>controller.clear(),'button button-ghost'),'clear');selectedHeading.append(count,clear);
  const selectedList=element('div','assistant-source-selected-list'),selectHint=element('p','assistant-source-hint');selectedWrap.append(selectedHeading,selectHint,selectedList);
  const next=l(button('',()=>controller.preview(),'button button-primary'),'preview');choice.append(selectedWrap,next);
  const review=element('section','assistant-source-review');
  const back=l(button('',()=>controller.back(),'button button-ghost'),'back'),sourceSummary=element('ul','assistant-source-summary');
  const original=l(element('h4'),'original');original.id='assistant-source-original';
  const previewText=element('pre','assistant-source-text');previewText.tabIndex=0;previewText.setAttribute('aria-labelledby',original.id);
  const truncated=l(element('p','assistant-source-warning'),'truncated');truncated.setAttribute('role','status');
  const targetField=element('div','assistant-source-field'),targetLabel=l(element('label'),'target');targetLabel.htmlFor='assistant-source-target';
  const target=element('select');target.id='assistant-source-target';target.addEventListener('change',()=>controller.setProject(target.value));targetField.append(targetLabel,target);
  const noProjects=element('div','assistant-source-no-projects'),projectLink=l(element('a','button button-secondary'),'projects');projectLink.href='#projects';projectLink.addEventListener('click',()=>controller.close());
  noProjects.append(l(element('p'),'noProjects'),projectLink);
  const use=l(button('',()=>controller.importPreview(),'button button-primary'),'use');
  const behavior=element('p','assistant-source-hint'),privacy=element('p','assistant-source-privacy');
  review.append(back,l(element('p','assistant-source-hint'),'previewHelp'),sourceSummary,truncated,original,previewText,l(element('p','assistant-source-hint'),'expiry'),targetField,noProjects,behavior,use);
  const loading=element('p','assistant-source-loading');loading.setAttribute('role','status');loading.setAttribute('aria-live','polite');
  const error=element('div','assistant-source-error');error.setAttribute('role','alert');const errorText=element('p');
  const retry=l(button('',()=>controller.state.retry?.()),'retry');error.append(errorText,retry);
  dialog.append(choice,review,loading,error,privacy);
  let previousFocus=null,shown=false,lastLanguage='',threadSignature='',selectionSignature='',projectSignature='',previewSignature='',directorySignature='',wasReview=false;
  const controller=createSourceImportController({api,language,getProjects,onImported,onChange:render});
  dialog.addEventListener('cancel',event=>{event.preventDefault();controller.close();});
  function render(){
    const state=controller.state,w=copy();
    if(!state.open){if(shown){dialog.close();shown=false;if(previousFocus?.isConnected)previousFocus.focus();}return;}
    if(!shown && dialog.isConnected){previousFocus=document.activeElement;dialog.showModal();shown=true;search.focus();}
    if(lastLanguage!==lang()){for(const[node,key]of labels)node.textContent=w[key];lastLanguage=lang();search.placeholder=w.searchPlaceholder;cwd.placeholder=w.cwdPlaceholder;threads.setAttribute('aria-label',w.chooseStep);}
    const busy=Boolean(state.busy),isReview=Boolean(state.preview),linking=state.mode==='link',submitting=['link','import'].includes(state.busy),limit=linking?1:SOURCE_THREAD_LIMIT;
    modes.setAttribute('aria-label',w.modeLabel);linkMode.setAttribute('aria-pressed',String(linking));importMode.setAttribute('aria-pressed',String(!linking));
    linkMode.disabled=importMode.disabled=busy || state.uncertain;modes.hidden=isReview;
    selectHint.textContent=linking?w.linkHint:w.selectHint;behavior.textContent=linking?w.linkBehavior:w.behavior;privacy.textContent=linking?w.linkPrivacy:w.privacy;targetLabel.textContent=linking?w.linkTarget:w.target;
    close.disabled=submitting;close.textContent=state.busy==='link'?w.linking:state.busy==='import'?w.closeImport:w.close;
    step.textContent=isReview?(linking?w.linkReviewStep:w.previewStep):w.chooseStep;choice.hidden=isReview;review.hidden=!isReview;
    dialog.setAttribute('aria-busy',String(busy));loading.hidden=!busy;loading.textContent=state.busy==='preview'?w.loadingPreview:state.busy==='link'?w.linking:state.busy==='import'?w.importing:w.loading;
    error.hidden=!state.error;errorText.textContent=state.error;retry.hidden=!state.retry;retry.disabled=busy;
    for(const control of [search,cwd,archived,filter,selectLoaded,refresh,clear,next,more,back])control.disabled=busy || state.uncertain;
    target.disabled=submitting || state.uncertain;next.disabled=busy || state.uncertain || !state.selected.length;selectLoaded.hidden=linking;selectLoaded.disabled=busy || state.uncertain || !state.threads.length || state.selected.length>=limit;clear.disabled=busy || state.uncertain || !state.selected.length;
    more.hidden=!state.nextCursor;done.hidden=!state.loaded || Boolean(state.nextCursor) || !state.threads.length || busy;empty.hidden=busy || !state.loaded || Boolean(state.threads.length);
    count.textContent=`${w.selected} ${state.selected.length}/${limit}`;
    const ds=JSON.stringify(state.projects);if(ds!==directorySignature){directories.replaceChildren(...state.projects.map(item=>{const option=element('option','',item.title || item.cwd);option.value=item.cwd;return option;}));directorySignature=ds;}
    const ts=JSON.stringify([lang(),state.mode,state.threads]);
    if(ts!==threadSignature){
      threads.replaceChildren(...state.threads.map(item=>{
        const row=element('label','assistant-source-row'),check=element('input');check.type=linking?'radio':'checkbox';check.name='assistant-source-thread';check.dataset.sourceId=item.id;check.addEventListener('change',()=>controller.select(item.id,check.checked));
        const content=element('span','assistant-source-row-copy'),name=element('strong','',item.title || w.untitled),path=element('span','',item.cwd || w.noCwd),date=element('small');
        const parsed=typeof item.updatedAt==='number'?new Date(item.updatedAt<1e12?item.updatedAt*1000:item.updatedAt):new Date(item.updatedAt || '');date.textContent=Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat(lang()==='en'?'en-US':'zh-CN',{dateStyle:'medium',timeStyle:'short'}).format(parsed):w.unknownDate;
        content.append(name,path,date);row.append(check,content);return row;
      }));threadSignature=ts;
    }
    for(const check of threads.querySelectorAll('input')){check.checked=state.selected.some(item=>item.id===check.dataset.sourceId);check.disabled=busy || state.uncertain || (!linking && !check.checked && state.selected.length>=limit);}
    const ss=JSON.stringify([lang(),state.selected,busy]);if(ss!==selectionSignature){selectedList.replaceChildren(...state.selected.map(item=>{const itemNode=element('div','assistant-source-selected');const remove=button('×',()=>{controller.select(item.id,false);const check=[...threads.querySelectorAll('input')].find(node=>node.dataset.sourceId===item.id);(check || search).focus();},'assistant-source-remove');remove.setAttribute('aria-label',`${w.remove}: ${item.title || w.untitled}`);remove.disabled=busy;itemNode.append(element('span','',item.title || w.untitled),remove);return itemNode;}));selectionSignature=ss;}
    if(isReview){
      const ps=JSON.stringify([lang(),state.preview.id]);if(ps!==previewSignature){previewText.textContent=state.preview.text;sourceSummary.replaceChildren(...(state.preview.sources || []).map(item=>element('li','',`${item.title || w.untitled}${item.cwd?` · ${item.cwd}`:''}${Number.isInteger(item.messageCount)?` · ${item.messageCount} ${w.messages}`:''}${item.truncated?` · ${w.partial}`:''}`)));previewSignature=ps;}
      truncated.hidden=!state.preview.truncated;truncated.textContent=linking?w.linkTruncated:w.truncated;
      const projects=getProjects() || [],pr=JSON.stringify([lang(),projects]);if(pr!==projectSignature){const blank=element('option','',w.chooseTarget);blank.value='';target.replaceChildren(blank,...projects.map(item=>{const option=element('option','',item.title);option.value=item.id;return option;}));projectSignature=pr;}
      target.value=state.projectId;targetField.hidden=!projects.length;noProjects.hidden=Boolean(projects.length);use.disabled=busy || (!state.uncertain && !projects.some(item=>item.id===state.projectId));use.textContent=submitting?(linking?w.linking:w.importing):state.uncertain?w.retry:linking?w.linkUse:w.use;
      if(!wasReview){previewText.focus();dialog.scrollTop=0;}
    }
    wasReview=isReview;
  }
  return {element:dialog,open:projectId=>controller.open(projectId),close:()=>controller.close(),render};
}
