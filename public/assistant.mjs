// Local Codex workspace. Research data is only changed by the server's Codex bridge.
import {createSourceImportDialog,sourceImportCopy} from './assistant-sources.mjs';
const words = {
  zh: {
    conversations:'对话', newConversation:'新对话', noConversations:'还没有对话。从右侧开始吧。',
    connect:'连接 Codex', reconnect:'重新连接', connecting:'正在连接…', checking:'正在检查连接…',
    connected:'Codex 已连接', disconnected:'连接电脑上的 Codex，开始研究', unavailable:'尚未找到 Codex',
    installHelp:'请先安装并打开 Codex，登录你的账号，然后重新连接。', login:'请先登录 Codex',
    loginHelp:'打开电脑上的 Codex 并登录，然后回到这里重新连接。无需填写 API Key。',
    connectionHelp:'使用电脑上已登录的 Codex。需要联网，使用量计入你的账号额度。',
    connectionError:'连接暂时中断', connectionRetry:'请检查 Codex 和网络，然后重新连接。', restartWorkspace:'请关闭旧的工作台服务，重新启动后刷新页面以启用 AI 助手。',
    adviceUnavailable:'当前工作台服务还不支持生成 AI 研究建议。请重新启动工作台服务并刷新页面，再重试。',
    background:'个对话正在运行', errorTitle:'暂时没有完成', retry:'重试', details:'查看详情',
    welcome:'研究的下一步，从一句话开始', welcomeText:'让 Codex 帮你写论文、梳理实验、整理进展。每个对话都可以单独继续。',
    welcomeHint:'先连接 Codex，再选一个操作，或直接描述你的需求。',
    project:'关联课题', noProject:'不指定课题', projectHint:'新对话会记住所选课题。', boundProject:'当前课题', missingProject:'原课题已不可用',
    general:'未指定课题', status:'状态', idle:'可以开始', running:'正在处理', waiting:'需要你确认', completed:'已回复', interrupted:'已停止', error:'处理遇到问题',
    you:'你', codex:'Codex', thinking:'Codex 正在处理…', waitingHelp:'请先处理下方的确认事项。',
    draft:'给 Codex 的消息', placeholder:'描述你想做的事，或粘贴真实进展…', send:'发送', sending:'正在发送…', stop:'停止', stopping:'正在停止…',
    continue:'继续聊', continueHint:'补充新的要求，或说明从哪里继续。', enterHint:'Enter 发送 · Shift + Enter 换行',
    action:'当前操作', clearAction:'取消快捷操作', shortcuts:'快捷操作', attach:'导入材料', attachmentHelp:'支持 .txt、.md、.csv；每个文件不超过 1 MB。内容会先放入输入框。',
    fileType:'请选择 .txt、.md 或 .csv 文本文件。', fileLarge:'文件超过 1 MB，请拆成较小的材料。', fileRead:'无法读取这个文件，请重试。', fileLoaded:'材料已放入输入框，检查后再发送。',
    execution:'执行过程', activityDone:'已完成', activityRunning:'进行中', activityError:'未完成', activityStopped:'已停止', requestCommand:'需要运行一个命令', requestFile:'需要修改文件', requestInput:'需要你补充信息',
    requestHelp:'检查内容后决定是否继续。', approve:'同意', decline:'拒绝', submitAnswers:'提交回答', choose:'请选择', orAnswer:'也可以直接填写答案', answer:'你的回答', answerRequired:'请回答每个问题后提交。',
    requestBusy:'正在提交…', removedRequest:'这项确认已处理，请查看最新消息。',
    progress:'一键更新', import:'导入进度', paper:'论文写作', experiment:'实验助手', advisor:'导师反馈', weekly:'生成周报', review:'论文审阅',
    progressHint:'粘贴本次真实进展，Codex 会整理并更新工作台。', importHint:'粘贴材料，或点击“导入材料”选取文件。',
    paperHint:'告诉 Codex 要写哪篇论文、哪个章节，以及已有的研究材料。', experimentHint:'描述实验目标、已有结果或需要解决的阻塞。',
    advisorHint:'粘贴真实导师反馈；需要 AI 建议时请说明。', weeklyHint:'补充周报的时间范围和要求，也可以直接发送。', reviewHint:'粘贴需要审阅的稿件或告诉 Codex 本地文件路径。',
    localNote:'对话保存在本机。切换页面不会停止正在进行的工作。', progressNote:'Codex 完成后，工作台会重新读取科研记录。',
    loading:'正在读取对话…', noMessages:'这个对话还没有消息。', missingConversation:'这个对话暂时无法读取，请重试。',
    busyLimit:'已有多个对话运行中，可以先继续查看，或等待一个完成。', newMessages:'查看最新消息', listShow:'显示对话', listHide:'收起对话',
    noMessage:'请先输入内容或选择一个快捷操作。', requestError:'提交失败，内容已保留。请重试。', network:'暂时无法连接本地服务，请确认网站仍在运行。',
    largeMessage:'材料过长，请拆成较小的段落后发送（每次最多 1 MB）。', draftKept:'发送未确认，草稿已保留。请先查看对话，再决定是否重试。',
    linked:'已关联 Codex 原对话', linkedShort:'已关联', linkedHelp:'这里与 Codex 使用同一个对话。用“一键更新”把明确进展保存到科研记录。',
    linkedProject:'原项目目录', linkedPartial:'网页只展示最近的部分文字；原对话上下文仍由 Codex 保留。',
    syncNow:'刷新对话', syncing:'正在同步…', synced:'消息已同步', syncFailed:'暂时无法同步，已保留当前消息与草稿。',
    unlink:'删除关联', unlinkConfirm:'确认解除关联', unlinkCancel:'取消', unlinking:'正在解除…', unlinked:'已解除关联，Codex 原对话和科研记录已保留。',
    unlinkHelp:'仅删除此工作台入口、本地聊天缓存及未发送草稿。Codex 原对话和已经保存的科研记录都会保留，以后可重新关联。', unlinkBusy:'请等待工作台回复完成或先点击停止，再解除关联。',
    externalRunning:'Codex 另一窗口正在处理这个对话。请等待完成，或回到 Codex 处理需要确认的内容。草稿已保留。', externalStatus:'原对话处理中',
    syncBeforeSend:'同步恢复后即可发送；你可以先编辑下一条消息。',
    sourceInUse:'原对话仍被 Codex 占用。请先停止原对话；若切换后仍被占用，退出 Codex 桌面应用，再在网页继续。', notSent:'这条消息未发送，草稿已保留。',
  },
  en: {
    conversations:'Conversations', newConversation:'New chat', noConversations:'No conversations yet. Start on the right.',
    connect:'Connect Codex', reconnect:'Reconnect', connecting:'Connecting…', checking:'Checking connection…',
    connected:'Codex is connected', disconnected:'Connect your local Codex to begin', unavailable:'Codex was not found',
    installHelp:'Install and open Codex, sign in to your account, then reconnect here.', login:'Sign in to Codex first',
    loginHelp:'Open Codex on this computer and sign in, then reconnect here. No API key is needed.',
    connectionHelp:'Uses Codex signed in on this computer. Internet access is required and account usage limits apply.',
    connectionError:'Connection interrupted', connectionRetry:'Check Codex and your connection, then reconnect.', restartWorkspace:'Close the old workspace service, restart it, then refresh this page to enable the AI assistant.',
    adviceUnavailable:'This workspace service does not support generating AI research advice yet. Restart the workspace service, refresh this page, then retry.',
    background:'chats running', errorTitle:'Something needs attention', retry:'Retry', details:'View details',
    welcome:'Start your next step with a conversation', welcomeText:'Write papers, plan experiments and organize progress with Codex. Keep each conversation moving at its own pace.',
    welcomeHint:'Connect Codex, then choose an action or describe what you need.',
    project:'Research project', noProject:'No specific project', projectHint:'A new chat remembers this project.', boundProject:'Current project', missingProject:'Original project is unavailable',
    general:'No specific project', status:'Status', idle:'Ready', running:'Working', waiting:'Your input is needed', completed:'Replied', interrupted:'Stopped', error:'Needs attention',
    you:'You', codex:'Codex', thinking:'Codex is working…', waitingHelp:'Please respond to the requests below.',
    draft:'Message to Codex', placeholder:'Describe what you need, or paste your research progress…', send:'Send', sending:'Sending…', stop:'Stop', stopping:'Stopping…',
    continue:'Continue chat', continueHint:'Add a new request, or explain where to continue.', enterHint:'Enter to send · Shift + Enter for a new line',
    action:'Selected action', clearAction:'Clear action', shortcuts:'Quick actions', attach:'Import material', attachmentHelp:'Accepts .txt, .md and .csv, up to 1 MB each. Text is added to your draft first.',
    fileType:'Choose a .txt, .md or .csv text file.', fileLarge:'The file is larger than 1 MB. Split it into smaller parts.', fileRead:'This file could not be read. Please try again.', fileLoaded:'Material added to your draft. Review it before sending.',
    execution:'Activity', activityDone:'Done', activityRunning:'In progress', activityError:'Not completed', activityStopped:'Stopped', requestCommand:'A command needs your approval', requestFile:'File changes need your approval', requestInput:'Codex needs your input',
    requestHelp:'Review the details before continuing.', approve:'Allow', decline:'Decline', submitAnswers:'Submit answers', choose:'Choose an answer', orAnswer:'Or write your own answer', answer:'Your answer', answerRequired:'Please answer every question before submitting.',
    requestBusy:'Submitting…', removedRequest:'This request has already been handled. Check the latest messages.',
    progress:'Update progress', import:'Import progress', paper:'Paper writing', experiment:'Experiment help', advisor:'Advisor feedback', weekly:'Weekly report', review:'Review a paper',
    progressHint:'Paste real progress and Codex will organize it and update the workspace.', importHint:'Paste your material, or choose a file with “Import material”.',
    paperHint:'Name the paper or section you want to work on and provide your research material.', experimentHint:'Describe the experiment, results so far or anything blocking you.',
    advisorHint:'Paste real advisor feedback. Say explicitly if you want AI suggestions.', weeklyHint:'Add a date range or other requirements, or send this action as it is.', reviewHint:'Paste the draft to review, or give Codex its local file path.',
    localNote:'Conversations stay on this computer. Switching pages does not stop ongoing work.', progressNote:'The workspace reloads research records after Codex finishes.',
    loading:'Loading conversation…', noMessages:'No messages in this conversation yet.', missingConversation:'This conversation could not be loaded. Please try again.',
    busyLimit:'Several chats are already running. You can read them while waiting for one to finish.', newMessages:'Jump to latest', listShow:'Show chats', listHide:'Hide chats',
    noMessage:'Enter a message or choose a quick action first.', requestError:'Could not submit. Your answers are still here. Please retry.', network:'The local service could not be reached. Check that the website is still running.',
    largeMessage:'This material is too long. Split it into smaller parts (up to 1 MB per message).', draftKept:'Sending was not confirmed. Your draft is still here. Check the conversation before retrying.',
    linked:'Linked to the original Codex chat', linkedShort:'Linked', linkedHelp:'This is the same chat as in Codex. Use “Update progress” to save clear progress to research records.',
    linkedProject:'Original project directory', linkedPartial:'This page displays only recent text. Codex retains the original chat context.',
    syncNow:'Refresh chat', syncing:'Syncing…', synced:'Messages synced', syncFailed:'Sync is temporarily unavailable. Your current messages and draft are kept.',
    unlink:'Remove link', unlinkConfirm:'Confirm unlink', unlinkCancel:'Cancel', unlinking:'Unlinking…', unlinked:'Link removed. The original Codex chat and research records are kept.',
    unlinkHelp:'Removes this workspace entry, its local chat cache and unsent draft. The original Codex chat and saved research records are kept. You can link the chat again later.', unlinkBusy:'Wait for the workspace reply or stop it before unlinking.',
    externalRunning:'Another Codex window is working in this chat. Wait for it to finish, or return to Codex to handle any requests. Your draft is kept.', externalStatus:'Active in Codex',
    syncBeforeSend:'Sending will be available when sync recovers. You can prepare your next message now.',
    sourceInUse:'Codex still owns this chat. Stop the original chat first. If switching away does not release it, quit the Codex desktop app, then continue here.', notSent:'This message was not sent. Your draft is kept.',
  },
};

export const assistantActionIds = Object.freeze(['progress','import','paper','experiment','advisor','weekly','review']);
export const ASSISTANT_FILE_LIMIT = 1024 * 1024;
export const ASSISTANT_MESSAGE_LIMIT = 1024 * 1024;
const languageCode = language => language === 'en' ? 'en' : 'zh';
const active = conversation => ['running','waiting'].includes(conversation?.status);
const externalActive = conversation => Boolean(conversation?.linkedSource?.externalRunning);
const linkedBlocked = conversation => externalActive(conversation) || Boolean(conversation?.linkedSource?.syncError);
const textValue = value => typeof value === 'string' ? value : '';

export function assistantCopy(language='zh') { return words[languageCode(language)]; }

export function assistantMessageFits(text) {
  return new TextEncoder().encode(text).byteLength <= ASSISTANT_MESSAGE_LIMIT;
}

export function assistantDraftWithCommand(draft, command='') {
  const text=textValue(draft?.text), previous=textValue(draft?.commandPrefix);
  const material=previous && text.startsWith(previous)?text.slice(previous.length):text;
  const normalized=textValue(command).trim();
  const commandPrefix=normalized?`${normalized}\n\n`:'';
  return {...draft,text:commandPrefix+material,commandPrefix};
}

export function validateAssistantFile(file, language='zh') {
  const copy = assistantCopy(language);
  if (!/\.(txt|md|csv)$/i.test(file?.name || '')) return copy.fileType;
  if (!Number.isFinite(file?.size) || file.size < 0 || file.size > ASSISTANT_FILE_LIMIT) return copy.fileLarge;
  return '';
}

export function normalizeAssistantQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((question, index) => ({
    id: textValue(question?.id) || `question-${index + 1}`,
    title: textValue(question?.question) || textValue(question?.header) || textValue(question?.title),
    options: Array.isArray(question?.options) ? question.options.map(option => typeof option === 'string'
      ? {label:option, description:''}
      : {label:textValue(option?.label), description:textValue(option?.description)}).filter(option => option.label) : [],
  }));
}

export function assistantRequestAnswers(questions, values) {
  const answers = Object.create(null);
  for (const question of normalizeAssistantQuestions(questions)) {
    const value = values[question.id] || {};
    const answer = textValue(value.text).trim() || textValue(value.option).trim();
    if (!answer) return null;
    answers[question.id] = {answers:[answer]};
  }
  return answers;
}

// All remote titles, messages and approval details enter the DOM through textContent.
function element(tag, className='', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
function append(parent, ...children) { parent.append(...children); return parent; }
function button(className, text, handler) {
  const node = element('button', className, text); node.type='button';
  if (handler) node.addEventListener('click', handler);
  return node;
}
function setText(node, value) { if (node.textContent !== value) node.textContent = value; }

export function createAssistantWorkspace({api, language='zh', getProjects=()=>[], getProjectId=()=>'', onResearchChange=()=>{}}={}) {
  if (typeof api !== 'function') throw new TypeError('Assistant workspace requires an api function.');
  let root, mounted=false, timer, mountEpoch=0, pollInFlight=false, lastOverview=0, selectedId=null;
  let status=null, summaries=[], conversation=null, loading=false, connecting=false, sending=false, stopping=false, refreshingLinked=false;
  let draftProject='', draftProjectInitialized=false, messageError='', info='', selectionVersion=0, mutationVersion=0, errorAction=null, pollError=false;
  let listCollapsed=false, labels=[], requestSignature='', listSignature='', projectSignature='', messageSignature='';
  let currentLanguage='', sendingId=null, requestBusy=new Set(), completedVersions=new Map();
  let sourceImporter;
  let unlinkTarget=null, unlinkingId=null;
  const drafts=new Map(), requestValues=new Map(), messageNodes=new Map(), requestNodes=new Map(), adviceRequests=new Map(), ref={};
  const lang=()=>languageCode(typeof language==='function'?language():language);
  const copy=()=>assistantCopy(lang());
  const currentDraft=()=>{
    const key=selectedId || '$new';
    if (!drafts.has(key)) drafts.set(key,{text:'',action:''});
    return drafts.get(key);
  };
  const initializeDraftProject=()=>{
    if(draftProjectInitialized)return;
    const id=getProjectId();draftProject=(getProjects() || []).some(project=>project.id===id)?id:'';
    draftProjectInitialized=true;
  };
  const localized=(node,key)=>{labels.push([node,key]);return node;};
  const localizedButton=(className,key,handler)=>localized(button(className,'',handler),key);
  const requestPath=id=>`/api/assistant/conversations/${encodeURIComponent(id)}`;
  const callApi=async(path,options={})=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),options.method==='POST'?90000:15000);
    try{return await api(path,{...options,signal:controller.signal});}
    catch(error){
      if(error?.status===404 && ['/api/assistant/status','/api/assistant/connect'].includes(path)){
        const unavailable=new Error(copy().restartWorkspace);unavailable.status=404;unavailable.code='ASSISTANT_UNAVAILABLE';throw unavailable;
      }
      if(path==='/api/assistant/advice' && (error?.status===404 && error.code==='NOT_FOUND' || error?.status===405 && error.code==='METHOD_NOT_ALLOWED')){
        const unavailable=new Error(copy().adviceUnavailable);unavailable.status=error.status;unavailable.code='ASSISTANT_ADVICE_UNAVAILABLE';throw unavailable;
      }
      throw error;
    }
    finally{clearTimeout(timeout);}
  };
  const ready=()=>Boolean(status?.connected && status?.loggedIn && status?.authMode==='chatgpt');
  const fail=(error, fallback, retry)=>{
    messageError=error?.message || copy()[fallback] || copy().network;
    errorAction=retry || null; pollError=false;render();
  };
  const notifyCompletion=(before,next)=>{
    const completionKey=`${next.status}:${next.updatedAt}`;
    if(['completed','interrupted','error'].includes(next.status) && active(before) && completedVersions.get(next.id)!==completionKey){
      completedVersions.set(next.id,completionKey);
      Promise.resolve().then(()=>onResearchChange()).catch(()=>{});
    }
  };

  function build() {
    root=element('section','assistant-workspace'); root.setAttribute('aria-label','AI');
    const connection=element('section','assistant-connection');
    const connectionText=element('div','assistant-connection-text');
    ref.connectionTitle=element('strong'); ref.connectionHelp=element('p');
    ref.runningCount=element('span','assistant-running-count');
    ref.connect=button('button button-primary assistant-connect','',connect);
    append(connectionText,ref.connectionTitle,ref.connectionHelp);
    append(connection,connectionText,ref.runningCount,ref.connect);

    const body=element('div','assistant-body');
    const sidebar=element('aside','assistant-sidebar');
    const sideHeader=element('div','assistant-side-heading');
    append(sideHeader,localized(element('h2'),'conversations'));
    ref.newChat=localizedButton('button button-secondary','newConversation',newConversation);
    ref.toggleList=button('assistant-list-toggle','',()=>{listCollapsed=!listCollapsed;render();});
    ref.toggleList.setAttribute('aria-controls','assistant-chat-list');
    append(sideHeader,ref.newChat,ref.toggleList);
    ref.list=element('div','assistant-chat-list'); ref.list.id='assistant-chat-list';
    ref.sourceImport=button('button button-secondary assistant-source-open','',()=>sourceImporter.open(conversation?.projectId || draftProject));
    append(sidebar,sideHeader,ref.sourceImport,ref.list,localized(element('p','assistant-local-note'),'localNote'));

    const chat=element('section','assistant-chat');
    const chatHeader=element('header','assistant-chat-header');
    const chatTitle=element('div','assistant-chat-title');
    ref.title=element('h2');ref.chatMeta=element('p');ref.chatStatus=element('span','assistant-chat-state');
    append(chatTitle,ref.title,ref.chatMeta);append(chatHeader,chatTitle,ref.chatStatus);
    ref.linked=element('section','assistant-linked');
    const linkedTop=element('div','assistant-linked-top');ref.linkedTitle=localized(element('strong'),'linked');ref.linkedRefresh=button('button button-secondary button-small','',refreshLinked);
    ref.unlink=localizedButton('button button-secondary button-small','unlink',()=>{unlinkTarget=selectedId;render();ref.unlinkCancel.focus();});
    const linkedActions=element('div','assistant-linked-actions');append(linkedActions,ref.linkedRefresh,ref.unlink);
    append(linkedTop,ref.linkedTitle,linkedActions);ref.linkedHelp=localized(element('p'),'linkedHelp');ref.linkedCwd=element('p','assistant-linked-path');
    ref.linkedState=element('p','assistant-linked-state');ref.linkedState.setAttribute('role','status');ref.linkedPartial=localized(element('p','assistant-linked-partial'),'linkedPartial');
    append(ref.linked,linkedTop,ref.linkedHelp,ref.linkedCwd,ref.linkedState,ref.linkedPartial);
    ref.unlinkPanel=element('div','assistant-unlink-confirm');ref.unlinkPanel.setAttribute('role','group');
    ref.unlinkPanel.setAttribute('aria-labelledby','assistant-unlink-help');
    const unlinkHelp=localized(element('p'),'unlinkHelp');unlinkHelp.id='assistant-unlink-help';
    ref.unlinkCancel=localizedButton('button button-secondary button-small','unlinkCancel',()=>{unlinkTarget=null;render();ref.unlink.focus();});
    ref.unlinkConfirm=button('button button-secondary button-small','',unlinkConversation);
    const unlinkActions=element('div','assistant-linked-actions');append(unlinkActions,ref.unlinkCancel,ref.unlinkConfirm);
    append(ref.unlinkPanel,unlinkHelp,unlinkActions);ref.linked.append(ref.unlinkPanel);
    ref.projectWrap=element('div','assistant-project-choice');
    ref.projectLabel=localized(element('label'),'project'); ref.projectLabel.htmlFor='assistant-project';
    ref.project=element('select'); ref.project.id='assistant-project';
    ref.project.addEventListener('change',()=>{draftProject=ref.project.value;});
    append(ref.projectWrap,ref.projectLabel,ref.project,localized(element('span'),'projectHint'));

    ref.scroll=element('div','assistant-transcript');ref.scroll.tabIndex=0;
    ref.scroll.setAttribute('aria-label',copy().conversations);
    ref.welcome=element('div','assistant-welcome');
    append(ref.welcome,element('span','assistant-welcome-mark','✦'),localized(element('h3'),'welcome'),localized(element('p'),'welcomeText'),localized(element('small'),'welcomeHint'));
    ref.loading=localized(element('p','assistant-transcript-empty'),'loading');
    ref.messages=element('div','assistant-messages');ref.messages.setAttribute('role','log');ref.messages.setAttribute('aria-live','off');
    ref.empty=localized(element('p','assistant-transcript-empty'),'noMessages');
    ref.thinking=element('p','assistant-thinking');ref.thinking.setAttribute('role','status');
    ref.requests=element('div','assistant-requests');
    ref.activity=element('details','assistant-activity');
    append(ref.activity,localized(element('summary'),'execution'));
    ref.activityList=element('ul');ref.activity.append(ref.activityList);
    append(ref.scroll,ref.welcome,ref.loading,ref.empty,ref.messages,ref.thinking,ref.requests,ref.activity);
    ref.latest=localizedButton('assistant-jump-latest','newMessages',()=>scrollToLatest());ref.latest.hidden=true;
    ref.scroll.addEventListener('scroll',()=>{if(isNearBottom())ref.latest.hidden=true;},{passive:true});

    ref.error=element('div','assistant-error');ref.error.setAttribute('role','alert');
    ref.errorMessage=element('p');ref.retry=localizedButton('button button-secondary button-small','retry',()=>{const retry=errorAction;messageError='';errorAction=null;render();if(retry)retry();else poll(true);});
    append(ref.error,ref.errorMessage,ref.retry);
    ref.info=element('p','assistant-info');ref.info.setAttribute('role','status');

    ref.composer=element('form','assistant-composer');
    ref.composer.addEventListener('submit',event=>{event.preventDefault();send();});
    const shortcuts=element('div','assistant-shortcuts');shortcuts.setAttribute('role','group');
    ref.shortcuts=shortcuts;ref.shortcutButtons=new Map();
    for(const action of assistantActionIds){const item=localizedButton('assistant-shortcut',action,()=>startAction(action));item.dataset.assistantAction=action;shortcuts.append(item);ref.shortcutButtons.set(action,item);}
    ref.actionWrap=element('div','assistant-selected-action');
    ref.actionLabel=element('span');ref.actionClear=localizedButton('assistant-action-clear','clearAction',()=>{const draft=currentDraft();Object.assign(draft,assistantDraftWithCommand(draft),{action:''});render();ref.input.focus();});
    append(ref.actionWrap,ref.actionLabel,ref.actionClear);
    ref.actionHint=element('p','assistant-action-hint');
    ref.input=element('textarea'); ref.input.id='assistant-message';ref.input.rows=3;ref.input.maxLength=ASSISTANT_MESSAGE_LIMIT;
    ref.input.addEventListener('input',()=>{
      const draft=currentDraft();draft.text=ref.input.value;
      // Once the user edits the inserted command, it becomes their own material.
      if(draft.commandPrefix && !draft.text.startsWith(draft.commandPrefix))draft.commandPrefix='';
      info='';updateComposer();
    });
    ref.input.addEventListener('keydown',event=>{
      if(event.key==='Enter' && !event.shiftKey && !event.isComposing && event.keyCode!==229){event.preventDefault();send();}
    });
    const inputLabel=localized(element('label','sr-only'),'draft');inputLabel.htmlFor='assistant-message';
    const controls=element('div','assistant-composer-controls');
    const attachWrap=element('div','assistant-attachment');
    ref.attach=localizedButton('button button-ghost','attach',()=>ref.file.click());
    ref.file=element('input');ref.file.type='file';ref.file.accept='.txt,.md,.csv,text/plain,text/markdown,text/csv';ref.file.hidden=true;
    ref.file.addEventListener('change',importFile);
    append(attachWrap,ref.attach,ref.file);
    const sendWrap=element('div','assistant-send-controls');
    ref.continue=localizedButton('button button-secondary','continue',()=>{info=copy().continueHint;render();ref.input.focus();});
    ref.stop=button('button button-secondary assistant-stop','',stop);
    ref.send=element('button','button button-primary assistant-send');ref.send.type='submit';
    append(sendWrap,ref.continue,ref.stop,ref.send);append(controls,attachWrap,sendWrap);
    const footer=element('div','assistant-composer-footnote');
    append(footer,localized(element('span'),'enterHint'),localized(element('span'),'progressNote'));
    append(ref.composer,shortcuts,ref.actionWrap,ref.actionHint,inputLabel,ref.input,controls,footer);
    append(chat,chatHeader,ref.linked,ref.projectWrap,ref.scroll,ref.latest,ref.error,ref.info,ref.composer);
    append(body,sidebar,chat);append(root,connection,body);
    sourceImporter=createSourceImportDialog({api,language:lang,getProjects,onImported:openCreatedConversation});
    root.append(sourceImporter.element);
  }

  function renderConnection() {
    const w=copy();
    let title=w.checking, help=w.connectionHelp;
    if(status){
      if(status.available===false){title=w.unavailable;help=w.installHelp;}
      else if((status.connected && status.loggedIn===false) || status.code==='CODEX_NOT_LOGGED_IN'){title=w.login;help=w.loginHelp;}
      else if(status.connected){title=w.connected;}
      else {title=w.disconnected;}
      if(status.error && status.available!==false && status.code!=='CODEX_NOT_LOGGED_IN'){
        title=status.code==='CODEX_CHATGPT_REQUIRED'?w.login:w.connectionError;
        help=typeof status.error==='string'?status.error:w.connectionRetry;
      }
    }
    if(connecting)title=w.connecting;
    setText(ref.connectionTitle,title);setText(ref.connectionHelp,help);
    setText(ref.connect,connecting?w.connecting:(status?.connected?w.reconnect:w.connect));
    ref.connect.disabled=connecting;ref.connect.hidden=ready() && !status?.error;
    ref.runningCount.hidden=!status?.runningCount;
    setText(ref.runningCount,`${status?.runningCount || 0} ${w.background}`);
    root.dataset.connected=String(ready());
  }

  function renderList() {
    const w=copy();
    const signature=JSON.stringify([lang(),selectedId,summaries.map(item=>[item.id,item.title,item.status,item.projectId,Boolean(item.linkedSource),externalActive(item)])]);
    if(signature!==listSignature){
      const existing=new Map([...ref.list.querySelectorAll('[data-conversation-id]')].map(node=>[node.dataset.conversationId,node]));
      const nodes=summaries.map(summary=>{
        let item=existing.get(summary.id);
        if(!item){
          item=button('assistant-chat-item','',()=>selectConversation(summary.id));item.dataset.conversationId=summary.id;
          append(item,element('strong'),element('span'));
        }
        setText(item.children[0],summary.title || w.newConversation);
        setText(item.children[1],`${summary.linkedSource?`${w.linkedShort} · `:''}${externalActive(summary)?w.externalStatus:w[summary.status] || w.idle}`);
        item.classList.toggle('is-selected',summary.id===selectedId);item.dataset.status=summary.status || 'idle';
        item.setAttribute('aria-current',summary.id===selectedId?'true':'false');
        return item;
      });
      if(!nodes.length)nodes.push(element('p','assistant-list-empty',w.noConversations));
      // Only move nodes when their actual order changes; polling never replaces focused buttons.
      for(let index=0;index<nodes.length;index++)if(ref.list.children[index]!==nodes[index])ref.list.insertBefore(nodes[index],ref.list.children[index] || null);
      for(const node of [...ref.list.children])if(!nodes.includes(node))node.remove();
      listSignature=signature;
    }
    sidebarToggle();
  }
  function sidebarToggle(){
    root.classList.toggle('assistant-list-collapsed',listCollapsed);
    ref.toggleList.setAttribute('aria-expanded',String(!listCollapsed));
    setText(ref.toggleList,listCollapsed?copy().listShow:copy().listHide);
  }
  function renderProjects() {
    const projects=getProjects() || [];
    const signature=JSON.stringify([lang(),projects.map(item=>[item.id,item.title])]);
    if(signature!==projectSignature){
      const option=element('option','',copy().noProject);option.value='';
      ref.project.replaceChildren(option,...projects.map(project=>{const node=element('option','',project.title);node.value=project.id;return node;}));
      projectSignature=signature;
    }
    if(draftProject && !projects.some(project=>project.id===draftProject))draftProject='';
    ref.project.value=draftProject;
    ref.projectWrap.hidden=Boolean(selectedId);
    if(selectedId){
      const id=conversation?.projectId || summaries.find(item=>item.id===selectedId)?.projectId;
      const project=projects.find(item=>item.id===id);
      setText(ref.chatMeta,`${copy().boundProject}: ${id?(project?.title || copy().missingProject):copy().general}`);
    }else setText(ref.chatMeta,copy().projectHint);
  }
  function isNearBottom(){return ref.scroll.scrollHeight-ref.scroll.scrollTop-ref.scroll.clientHeight<90;}
  function scrollToLatest(){ref.scroll.scrollTop=ref.scroll.scrollHeight;ref.latest.hidden=true;}
  function renderMessages() {
    const messages=conversation?.messages || [];
    const signature=JSON.stringify([selectedId,lang(),messages.map(message=>[message.id,message.role,message.text])]);
    if(signature===messageSignature)return;
    const follow=isNearBottom();const nodes=[];
    for(let index=0;index<messages.length;index++){
      const message=messages[index];const key=`${selectedId}:${message.id || index}`;
      let article=messageNodes.get(key);
      if(!article){
        article=element('article',`assistant-message assistant-message-${message.role==='user'?'user':'assistant'}`);
        append(article,element('strong','assistant-message-role'),element('div','assistant-message-content'));
        messageNodes.set(key,article);
      }
      setText(article.children[0],message.role==='user'?copy().you:copy().codex);
      setText(article.children[1],textValue(message.text));nodes.push(article);
    }
    for(let index=0;index<nodes.length;index++)if(ref.messages.children[index]!==nodes[index])ref.messages.insertBefore(nodes[index],ref.messages.children[index] || null);
    for(const node of [...ref.messages.children])if(!nodes.includes(node))node.remove();
    for(const [key,node] of messageNodes)if(!nodes.includes(node))messageNodes.delete(key);
    messageSignature=signature;
    if(follow)scrollToLatest();else if(messages.length)ref.latest.hidden=false;
  }

  function renderRequests() {
    const requests=conversation?.pendingRequests || [];
    const signature=JSON.stringify([selectedId,lang(),requests]);
    if(signature!==requestSignature){
      const nodes=[];
      for(const request of requests){
        const nodeSignature=JSON.stringify([selectedId,lang(),request]);
        const previous=requestNodes.get(request.id);
        if(previous?.signature===nodeSignature){nodes.push(previous.node);continue;}
        const card=element('section','assistant-request');card.dataset.requestId=request.id;
        const fallback=request.kind==='input'?'requestInput':request.kind==='file'?'requestFile':'requestCommand';
        append(card,element('h3','',textValue(request.title) || copy()[fallback]));
        if(request.description)append(card,element('pre','assistant-request-description',textValue(request.description)));
        const valuesKey=`${selectedId}:${request.id}`;
        if(!requestValues.has(valuesKey))requestValues.set(valuesKey,Object.create(null));
        const values=requestValues.get(valuesKey);
        const questions=normalizeAssistantQuestions(request.questions);
        if(request.kind==='input')for(const question of questions){
          const field=element('fieldset','assistant-question');append(field,element('legend','',question.title));
          if(!values[question.id])values[question.id]={text:'',option:''};
          const value=values[question.id];
          if(question.options.length){
            const select=element('select');select.setAttribute('aria-label',question.title || copy().choose);
            const blank=element('option','',copy().choose);blank.value='';select.append(blank);
            for(const option of question.options){const node=element('option','',option.description?`${option.label} — ${option.description}`:option.label);node.value=option.label;select.append(node);}
            select.value=value.option;select.addEventListener('change',()=>{value.option=select.value;});field.append(select);
          }
          const answer=element('textarea');answer.rows=2;answer.value=value.text;answer.placeholder=question.options.length?copy().orAnswer:copy().answer;
          answer.setAttribute('aria-label',`${question.title || copy().answer}: ${copy().answer}`);answer.addEventListener('input',()=>{value.text=answer.value;});field.append(answer);card.append(field);
        }
        if(request.kind!=='input')append(card,element('p','assistant-request-help',copy().requestHelp));
        const controls=element('div','assistant-request-controls');
        append(controls,button('button button-secondary',copy().decline,()=>respond(request,'decline')),
          button('button button-primary',request.kind==='input'?copy().submitAnswers:copy().approve,()=>respond(request,'accept')));
        card.append(controls);nodes.push(card);requestNodes.set(request.id,{node:card,signature:nodeSignature});
      }
      for(let index=0;index<nodes.length;index++)if(ref.requests.children[index]!==nodes[index])ref.requests.insertBefore(nodes[index],ref.requests.children[index] || null);
      for(const node of [...ref.requests.children])if(!nodes.includes(node))node.remove();
      for(const [id,cached] of requestNodes)if(!nodes.includes(cached.node))requestNodes.delete(id);
      requestSignature=signature;
    }
    for(const node of ref.requests.querySelectorAll('[data-request-id]')){
      const busy=requestBusy.has(node.dataset.requestId);node.setAttribute('aria-busy',String(busy));
      for(const control of node.querySelectorAll('button,select,textarea'))control.disabled=busy;
    }
  }

  function updateComposer() {
    if(!root)return;
    const w=copy(), draft=currentDraft(), busy=active(conversation),blocked=linkedBlocked(conversation);
    if(ref.input.value!==draft.text)ref.input.value=draft.text;
    ref.input.placeholder=draft.action?w[`${draft.action}Hint`]:w.placeholder;
    ref.shortcuts.setAttribute('aria-label',w.shortcuts);
    ref.actionWrap.hidden=!draft.action;ref.actionHint.hidden=!draft.action;
    setText(ref.actionLabel,draft.action?`${w.action} · ${w[draft.action]}`:'');
    setText(ref.actionHint,draft.action?w[`${draft.action}Hint`]:'');
    for(const [action,node] of ref.shortcutButtons)node.setAttribute('aria-pressed',String(action===draft.action));
    ref.attach.title=w.attachmentHelp;
    ref.send.disabled=sending || unlinkingId===selectedId && Boolean(selectedId) || busy || blocked || refreshingLinked || loading || !ready() || (!draft.text.trim() && !draft.action);
    setText(ref.send,sending?w.sending:w.send);
    ref.stop.hidden=!busy || externalActive(conversation);ref.stop.disabled=stopping || sending;
    setText(ref.stop,stopping?w.stopping:w.stop);
    ref.continue.hidden=!selectedId || busy || blocked || loading || (conversation?.status!=='interrupted' && conversation?.status!=='error');
    ref.newChat.disabled=sending && !selectedId;
    ref.sourceImport.disabled=sending;
    setText(ref.sourceImport,sourceImportCopy(lang()).open);
    ref.project.disabled=sending;
    // Users can prepare their next message while another turn is running.
    ref.input.readOnly=sending && sendingId===selectedId;
  }

  function renderLinked() {
    const w=copy(),source=conversation?.linkedSource;
    ref.linked.hidden=!source;
    if(!source)return;
    setText(ref.linkedCwd,source.cwd?`${w.linkedProject}: ${source.cwd}`:'');ref.linkedCwd.hidden=!source.cwd;
    setText(ref.linkedRefresh,refreshingLinked?w.syncing:w.syncNow);ref.linkedRefresh.disabled=refreshingLinked || loading || sending;
    const unlinkBusy=active(conversation) && !externalActive(conversation) || sending || stopping;
    ref.unlink.disabled=unlinkBusy || Boolean(unlinkingId);ref.unlink.title=unlinkBusy?w.unlinkBusy:w.unlinkHelp;
    ref.unlinkPanel.hidden=unlinkTarget!==selectedId;
    setText(ref.unlinkConfirm,unlinkingId===selectedId?w.unlinking:w.unlinkConfirm);
    ref.unlinkConfirm.disabled=unlinkBusy || Boolean(unlinkingId);ref.unlinkCancel.disabled=Boolean(unlinkingId);
    ref.linkedPartial.hidden=!source.truncated;
    const date=new Date(source.syncedAt || '');
    const time=Number.isFinite(date.getTime())?new Intl.DateTimeFormat(lang()==='en'?'en-US':'zh-CN',{hour:'2-digit',minute:'2-digit'}).format(date):'';
    const state=source.syncError?`${w.syncFailed} ${textValue(source.syncError)} ${w.syncBeforeSend}`:externalActive(conversation)?w.externalRunning:`${w.synced}${time?` · ${time}`:''}`;
    setText(ref.linkedState,state);ref.linkedState.dataset.error=String(Boolean(source.syncError));
  }

  function render() {
    if(!root)return;
    const w=copy();
    if(currentLanguage!==lang()){
      currentLanguage=lang();for(const [node,key] of labels)setText(node,w[key]);
      ref.scroll.setAttribute('aria-label',w.conversations);
    }
    renderConnection();renderList();renderProjects();renderMessages();renderRequests();updateComposer();renderLinked();
    sourceImporter?.render();
    setText(ref.title,selectedId?(conversation?.title || summaries.find(item=>item.id===selectedId)?.title || w.newConversation):w.newConversation);
    ref.chatStatus.hidden=!selectedId;setText(ref.chatStatus,externalActive(conversation)?w.externalStatus:w[conversation?.status] || w.idle);ref.chatStatus.dataset.status=externalActive(conversation)?'running':conversation?.status || 'idle';
    ref.welcome.hidden=Boolean(selectedId);ref.loading.hidden=!loading;
    ref.empty.hidden=!selectedId || loading || Boolean(conversation?.messages?.length) || active(conversation);
    ref.thinking.hidden=!active(conversation);setText(ref.thinking,conversation?.status==='waiting'?w.waitingHelp:w.thinking);
    ref.error.hidden=!messageError && !conversation?.error;
    setText(ref.errorMessage,messageError || textValue(conversation?.error));
    ref.retry.hidden=!messageError;
    ref.info.hidden=!info;setText(ref.info,info);
    const activity=conversation?.activity || [];
    ref.activity.hidden=!activity.length;
    const activitySignature=JSON.stringify([lang(),activity]);
    if(ref.activity.dataset.signature!==activitySignature){
      ref.activityList.replaceChildren(...activity.map(item=>{
        const row=element('li');row.dataset.status=item.status || 'running';
        const stateKey={completed:'activityDone',running:'activityRunning',error:'activityError',interrupted:'activityStopped'}[item.status];
        append(row,element('span','',textValue(item.label)),element('small','',stateKey?w[stateKey]:w[item.status] || ''));
        return row;
      }));ref.activity.dataset.signature=activitySignature;
    }
  }

  function updateConversation(next) {
    if(!next || next.id!==selectedId)return;
    const before=conversation;
    conversation=next;loading=false;
    notifyCompletion(before,next);
    render();
  }

  function schedule() {
    clearTimeout(timer);
    if(mounted)timer=setTimeout(()=>poll(),active(conversation)?750:2500);
  }
  async function refreshLinked() {
    if(!selectedId || !conversation?.linkedSource || refreshingLinked)return;
    const id=selectedId,epoch=mountEpoch,version=selectionVersion;
    refreshingLinked=true;render();
    try{const result=await callApi(requestPath(id));if(epoch===mountEpoch && version===selectionVersion)updateConversation(result.conversation);}
    catch(error){if(epoch===mountEpoch && version===selectionVersion)fail(error,'network',refreshLinked);}
    finally{refreshingLinked=false;render();}
  }
  async function poll(force=false) {
    if(!mounted || pollInFlight || unlinkingId){if(mounted)schedule();return;}
    pollInFlight=true;
    const epoch=mountEpoch, version=selectionVersion, selected=selectedId, writes=mutationVersion;
    try{
      const jobs=[];
      if(force || Date.now()-lastOverview>=2400){
        jobs.push(Promise.allSettled([callApi('/api/assistant/status'),callApi('/api/assistant/conversations')]).then(([statusResult,listResult])=>{
          if(statusResult.status==='rejected')throw statusResult.reason;
          if(listResult.status==='rejected')throw listResult.reason;
          const nextStatus=statusResult.value,result=listResult.value;
          if(epoch!==mountEpoch || writes!==mutationVersion)return;
          status=nextStatus;
          const nextSummaries=Array.isArray(result.conversations)?result.conversations:[];
          for(const item of nextSummaries)notifyCompletion(summaries.find(previous=>previous.id===item.id),item);
          summaries=nextSummaries;lastOverview=Date.now();
          render();
        }));
      }
      if(selected)jobs.push(callApi(requestPath(selected)).then(result=>{
        if(epoch===mountEpoch && version===selectionVersion && writes===mutationVersion)updateConversation(result.conversation);
      }));
      const results=await Promise.allSettled(jobs);
      if(epoch===mountEpoch && version===selectionVersion && writes===mutationVersion){
        const failure=results.find(result=>result.status==='rejected');
        if(failure){loading=false;fail(failure.reason,'network',()=>poll(true));pollError=true;}
        else if(pollError){messageError='';errorAction=null;pollError=false;render();}
      }
    }finally{pollInFlight=false;if(epoch===mountEpoch)schedule();}
  }

  async function connect() {
    if(connecting)return;
    connecting=true;messageError='';errorAction=null;mutationVersion++;render();
    try{status=await callApi('/api/assistant/connect',{method:'POST',body:{}});lastOverview=0;}
    catch(error){fail(error,'network',connect);}
    finally{connecting=false;render();poll(true);}
  }

  async function unlinkConversation() {
    if(!selectedId || unlinkTarget!==selectedId || !conversation?.linkedSource || unlinkingId || sending)return;
    const id=selectedId,version=selectionVersion;
    unlinkingId=id;mutationVersion++;messageError='';errorAction=null;render();
    try {
      await callApi(`${requestPath(id)}/unlink`,{method:'POST',body:{}});
      summaries=summaries.filter(item=>item.id!==id);drafts.delete(id);completedVersions.delete(id);lastOverview=0;
      if(selectedId===id){newConversation();info=copy().unlinked;}
    } catch(error) {
      if(selectedId===id && version===selectionVersion)fail(error,'network',unlinkConversation);
    } finally {
      unlinkingId=null;mutationVersion++;render();poll(true);schedule();
    }
  }

  async function selectConversation(id) {
    if(id===selectedId && conversation)return;
    unlinkTarget=null;selectedId=id;conversation=null;loading=true;selectionVersion++;messageSignature='';requestSignature='';info='';messageError='';errorAction=null;
    const version=selectionVersion;render();
    try{const result=await callApi(requestPath(id));if(version===selectionVersion){updateConversation(result.conversation);scrollToLatest();}}
    catch(error){if(version===selectionVersion){loading=false;fail(error,'missingConversation',()=>selectConversation(id));}}
    schedule();
  }

  function newConversation() {
    unlinkTarget=null;
    selectedId=null;conversation=null;loading=false;selectionVersion++;messageSignature='';requestSignature='';info='';messageError='';errorAction=null;
    const id=getProjectId();draftProject=(getProjects() || []).some(project=>project.id===id)?id:'';draftProjectInitialized=true;
    render();if(root && mounted){ref.input.focus();scrollToLatest();}schedule();
  }

  function openCreatedConversation(created) {
    unlinkTarget=null;
    // Imported, linked and advice chats have separate drafts. Opening one never
    // consumes the current chat draft or the draft for a future new chat.
    mutationVersion++;selectionVersion++;selectedId=created.id;conversation=created;loading=false;
    messageSignature='';requestSignature='';messageError='';info='';errorAction=null;
    summaries=[created,...summaries.filter(item=>item.id!==created.id)];lastOverview=0;
    if(['completed','interrupted','error'].includes(created.status))Promise.resolve().then(()=>onResearchChange()).catch(()=>{});
    render();if(root)scrollToLatest();poll(true);schedule();
  }

  function startAdvice({requestId,projectId,focus='',language:requestedLanguage}={}) {
    if(typeof requestId!=='string' || !requestId.trim())return Promise.reject(new TypeError('Advice requires a request ID.'));
    const scope={projectId:textValue(projectId),focus:textValue(focus)};
    let request=adviceRequests.get(requestId);
    if(request && (request.payload.projectId!==scope.projectId || request.payload.focus!==scope.focus)){
      return Promise.reject(new TypeError('An advice request ID cannot be reused for a different project or question.'));
    }
    if(!request){
      // The first language and scope survive a lost reply, so an explicit retry
      // asks the server for the same idempotent operation rather than a new turn.
      request={payload:{requestId,...scope,language:requestedLanguage===undefined?lang():languageCode(requestedLanguage)},promise:null};
      adviceRequests.set(requestId,request);
    }
    if(request.promise)return request.promise;
    request.promise=callApi('/api/assistant/advice',{method:'POST',body:request.payload}).then(result=>{
      const created=result?.conversation;
      if(!created?.id)throw new Error(copy().missingConversation);
      openCreatedConversation(created);
      return created;
    }).catch(error=>{
      // A failed request leaves the selected chat untouched. The caller owns
      // the error/retry UI; retrying this ID keeps its original payload.
      request.promise=null;
      throw error;
    });
    return request.promise;
  }

  function startAction(action, options={}) {
    if(!assistantActionIds.includes(action))return;
    initializeDraftProject();
    if(Object.hasOwn(options,'projectId')){
      const requested=(getProjects() || []).some(project=>project.id===options.projectId)?options.projectId:'';
      const bound=conversation?.projectId || summaries.find(item=>item.id===selectedId)?.projectId || '';
      if(selectedId && requested!==bound)newConversation();
      if(!selectedId)draftProject=requested;
    }
    const draft=currentDraft();Object.assign(draft,assistantDraftWithCommand(draft,options.command),{action});
    info='';render();
    if(mounted)ref.input.focus();
  }

  async function send() {
    const draft=currentDraft();const text=draft.text.trim() || (draft.action?copy()[draft.action]:'');
    if(sending || unlinkingId===selectedId && Boolean(selectedId) || active(conversation) || linkedBlocked(conversation) || refreshingLinked || loading)return;
    if(!ready()){messageError=copy().disconnected;errorAction=connect;render();return;}
    if(!text){info=copy().noMessage;render();return;}
    if(!assistantMessageFits(text)){messageError=copy().largeMessage;render();return;}
    sending=true;sendingId=selectedId;messageError='';info='';errorAction=null;mutationVersion++;
    const initialId=selectedId, selection=selectionVersion, original={...draft}, linkedTarget=Boolean(conversation?.linkedSource);let targetId=selectedId;
    render();
    try{
      if(!targetId){
        const result=await callApi('/api/assistant/conversations',{method:'POST',body:{projectId:draftProject || undefined,language:lang()}});
        targetId=result.conversation.id;
        drafts.set(targetId,{...original});
        if(selectedId===initialId && selection===selectionVersion){selectedId=targetId;conversation=result.conversation;sendingId=targetId;selectionVersion++;render();}
        summaries=[result.conversation,...summaries.filter(item=>item.id!==targetId)];
      }
      const result=await callApi(`${requestPath(targetId)}/messages`,{method:'POST',body:{text,...(original.action?{action:original.action}:{})}});
      // Clear only the exact submitted draft, never a newer draft from another chat.
      const submitted=drafts.get(targetId);
      if(submitted?.text===original.text && submitted.action===original.action)drafts.set(targetId,{text:'',action:''});
      if(!initialId){const empty=drafts.get('$new');if(empty?.text===original.text && empty.action===original.action)drafts.set('$new',{text:'',action:''});}
      if(selectedId===targetId){updateConversation(result.conversation);scrollToLatest();}
      summaries=[result.conversation,...summaries.filter(item=>item.id!==targetId)];lastOverview=0;
    }catch(error){
      const inUse=linkedTarget && ['SOURCE_THREAD_IN_USE','LINKED_THREAD_IN_USE'].includes(error?.code);
      const detail=inUse?copy().sourceInUse:error?.message || copy().network;
      const note=inUse || error?.status>=400 && error.status<500?copy().notSent:copy().draftKept;
      if(selectedId===targetId || (selectedId===initialId && selection===selectionVersion))fail(new Error(`${detail} ${note}`),'network',()=>poll(true));
    }finally{sending=false;sendingId=null;mutationVersion++;render();poll(true);schedule();}
  }

  async function stop() {
    if(!selectedId || !active(conversation) || externalActive(conversation) || stopping)return;
    const id=selectedId;stopping=true;mutationVersion++;messageError='';render();
    try{const result=await callApi(`${requestPath(id)}/stop`,{method:'POST',body:{}});if(selectedId===id && result?.conversation)updateConversation(result.conversation);}
    catch(error){if(selectedId===id)fail(error,'network',()=>{if(selectedId===id)stop();});}
    finally{stopping=false;mutationVersion++;render();poll(true);}
  }

  async function respond(request, decision, id=selectedId) {
    if(!id || requestBusy.has(request.id))return;
    let answers;
    if(request.kind==='input' && decision==='accept'){
      answers=assistantRequestAnswers(request.questions,requestValues.get(`${id}:${request.id}`) || {});
      if(!answers || !Object.keys(answers).length){info=copy().answerRequired;render();return;}
    }
    requestBusy.add(request.id);mutationVersion++;messageError='';info='';render();
    try{
      const result=await callApi(`${requestPath(id)}/requests/${encodeURIComponent(request.id)}`,{method:'POST',body:{decision,...(answers?{answers}:{})}});
      requestValues.delete(`${id}:${request.id}`);
      if(selectedId===id && result?.conversation)updateConversation(result.conversation);
    }catch(error){if(selectedId===id)fail(error,'requestError',()=>respond(request,decision,id));}
    finally{requestBusy.delete(request.id);mutationVersion++;render();poll(true);}
  }

  async function importFile() {
    const file=ref.file.files?.[0];ref.file.value='';if(!file)return;
    const problem=validateAssistantFile(file,lang());
    if(problem){messageError=problem;errorAction=null;render();return;}
    const draft=currentDraft();
    try{
      const content=await file.text();
      if(content.includes('\u0000')){messageError=copy().fileType;render();return;}
      const next=`${draft.text}${draft.text?'\n\n':''}--- ${file.name} ---\n${content}`;
      if(!assistantMessageFits(next)){messageError=copy().largeMessage;render();return;}
      draft.text=next;if(!draft.action)draft.action='import';
      info=copy().fileLoaded;messageError='';render();if(currentDraft()===draft)ref.input.focus();
    }catch{messageError=copy().fileRead;render();}
  }

  function mount(container) {
    if(!container?.append)throw new TypeError('Assistant workspace requires a container.');
    if(!root){build();initializeDraftProject();}
    if(root.parentNode!==container)container.replaceChildren(root);
    render();
    if(!mounted){mounted=true;mountEpoch++;poll(true);}
  }
  function unmount() {
    sourceImporter?.close();
    mounted=false;mountEpoch++;clearTimeout(timer);root?.remove();
    // The detached DOM retains drafts, history and local controls for the next visit.
  }
  return {mount,unmount,newConversation,startAction,startAdvice};
}
