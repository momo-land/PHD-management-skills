// Appearance changes only presentation. Research records and current view state stay intact.
export const themeDefinitions = Object.freeze([
  {id:'sage', nameZh:'林间手记', nameEn:'Field Notes', descriptionZh:'温润绿意与柔和留白，陪伴每天的研究。', descriptionEn:'Warm greens and gentle space for everyday research.', tagZh:'自然 · 舒展', tagEn:'Natural · Calm', metaColor:'#f3f3eb'},
  {id:'ocean', nameZh:'云端蓝图', nameEn:'Blueprints', descriptionZh:'蓝白空间与清晰网格，让计划一目了然。', descriptionEn:'Crisp blue and white spaces with clear grids for a sharper plan.', tagZh:'理性 · 清晰', tagEn:'Structured · Clear', metaColor:'#edf3fa'},
  {id:'paper', nameZh:'学术纸刊', nameEn:'Editorial', descriptionZh:'纸张质感与书刊排版，为思考留出空间。', descriptionEn:'Paper tones and editorial typography with room to think.', tagZh:'经典 · 专注', tagEn:'Classic · Focused', metaColor:'#f5f1e8'},
  {id:'midnight', nameZh:'深空实验室', nameEn:'Night Lab', descriptionZh:'深色工作空间与精确细节，适合沉浸探索。', descriptionEn:'A dark workspace with precise details for deep exploration.', tagZh:'深色 · 沉浸', tagEn:'Dark · Immersive', metaColor:'#0d1422'},
  {id:'studio', nameZh:'极简工作室', nameEn:'Studio', descriptionZh:'黑白留白与暖色点缀，让内容成为主角。', descriptionEn:'Monochrome space with warm accents that put content first.', tagZh:'极简 · 利落', tagEn:'Minimal · Crisp', metaColor:'#f4f4f2'},
  {id:'iris', nameZh:'鸢尾花园', nameEn:'Iris', descriptionZh:'轻盈紫调与圆润卡片，给灵感一点色彩。', descriptionEn:'Soft violet and rounded cards for a little creative energy.', tagZh:'柔和 · 灵感', tagEn:'Soft · Creative', metaColor:'#f5f1fa'},
].map(theme => Object.freeze(theme)));

const themeIds = new Set(themeDefinitions.map(theme => theme.id));
const copy = {
  zh:{title:'界面风格', description:'选择喜欢的风格，立即生效。', current:'正在使用', choose:'选择此风格', done:'完成', close:'关闭外观设置', change:'切换界面风格', selected:'当前风格', note:'偏好会在此浏览器中记住。', storageError:'已切换；此浏览器无法保存偏好。', style:'外观'},
  en:{title:'Appearance', description:'Choose a style to apply it immediately.', current:'In use', choose:'Choose style', done:'Done', close:'Close appearance settings', change:'Change appearance', selected:'Current style', note:'Your preference is remembered in this browser.', storageError:'Style changed; this browser could not save your preference.', style:'Appearance'},
};
const svg = (paths, className='') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const checkIcon = svg('<path d="m5 12 4 4L19 6"/>');
const closeIcon = svg('<path d="m6 6 12 12M18 6 6 18"/>');
const paletteIcon = svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>');
const chevronIcon = svg('<path d="m8 10 4 4 4-4"/>');
const langCode = language => language === 'en' ? 'en' : 'zh';
const themeName = (theme, language) => language === 'en' ? theme.nameEn : theme.nameZh;
const currentTheme = () => normalizeTheme(globalThis.document?.documentElement?.dataset.theme);

export function normalizeTheme(value) {
  return themeIds.has(value) ? value : 'sage';
}

export function applyTheme(value, {persist=true}={}) {
  const theme = normalizeTheme(value);
  const definition = themeDefinitions.find(item => item.id === theme);
  const document = globalThis.document;
  if (document) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', definition.metaColor);
  }
  let persisted = !persist;
  if (persist) {
    try { globalThis.localStorage.setItem('phd-theme', theme); persisted = true; }
    catch { persisted = false; }
  }
  return {theme, persisted};
}

function preview(theme, language) {
  return `<span class="appearance-preview appearance-preview-${theme.id}" aria-hidden="true">
    <span class="ap-sidebar"><span class="ap-brand"></span><span class="ap-nav ap-nav-active"></span><span class="ap-nav"></span><span class="ap-nav"></span><span class="ap-nav"></span><span class="ap-sidebar-bottom"></span></span>
    <span class="ap-workspace"><span class="ap-topbar"><span></span><i></i></span><span class="ap-page"><span class="ap-heading">${language==='en'?'Research<span>Overview</span>':'科研<span>总览</span>'}</span><span class="ap-stats"><i></i><i></i><i></i></span><span class="ap-hero"><span class="ap-hero-label"></span><span class="ap-hero-title"></span><span class="ap-hero-line"></span><i></i></span><span class="ap-bottom"><span><i></i><i></i><i></i></span><span><i></i><i></i></span></span></span></span>
  </span>`;
}

export function renderThemePicker(language='zh') {
  const languageCode = langCode(language);
  const words = copy[languageCode];
  const selected = currentTheme();
  return `<div class="appearance-heading"><div><h2 id="appearance-title">${words.title}</h2><p id="appearance-description">${words.description}</p></div><button type="button" class="appearance-close" data-appearance-close aria-label="${words.close}">${closeIcon}</button></div>
    <div class="appearance-grid" role="group" aria-labelledby="appearance-title">${themeDefinitions.map(theme => {
      const active = theme.id === selected;
      const name = themeName(theme,languageCode);
      const description = languageCode === 'en' ? theme.descriptionEn : theme.descriptionZh;
      const tag = languageCode === 'en' ? theme.tagEn : theme.tagZh;
      return `<button type="button" class="appearance-card" data-theme-choice="${theme.id}" aria-pressed="${active}" aria-label="${name}: ${description}">${preview(theme,languageCode)}<span class="appearance-card-body"><span class="appearance-card-heading"><strong>${name}</strong><span class="appearance-check">${checkIcon}</span></span><span class="appearance-tag">${tag}</span><span class="appearance-description">${description}</span><span class="appearance-card-footer"><span class="appearance-swatches appearance-swatches-${theme.id}" aria-hidden="true"><i></i><i></i><i></i></span><span class="appearance-choice-label">${active ? words.current : words.choose}</span></span></span></button>`;
    }).join('')}</div>
    <div class="appearance-footer"><div><p class="appearance-live" role="status" aria-live="polite" aria-atomic="true"></p><p class="appearance-note">${words.note}</p></div><button type="button" class="button button-primary appearance-done" data-appearance-close>${words.done}${checkIcon}</button></div>`;
}

export function updateThemePicker(value, language='zh') {
  const theme = normalizeTheme(value);
  const languageCode = langCode(language);
  const words = copy[languageCode];
  const definition = themeDefinitions.find(item => item.id === theme);
  const document = globalThis.document;
  if (!document) return;
  const trigger = document.getElementById('appearance-trigger');
  if (trigger) {
    trigger.setAttribute('aria-label', `${words.change} · ${themeName(definition, languageCode)}`);
    trigger.setAttribute('title', words.style);
    const name = trigger.querySelector('.appearance-trigger-name');
    if (name) name.textContent = themeName(definition, languageCode);
  }
  const dialog = document.getElementById('appearance-dialog');
  if (!dialog) return;
  for (const card of dialog.querySelectorAll('[data-theme-choice]')) {
    const active = card.dataset.themeChoice === theme;
    card.setAttribute('aria-pressed', String(active));
    const label = card.querySelector('.appearance-choice-label');
    if (label) label.textContent = active ? words.current : words.choose;
  }
  const live = dialog.querySelector('.appearance-live');
  if (live) live.textContent = `${words.selected}: ${themeName(definition, languageCode)}`;
}

export function initAppearance({onStorageError=()=>{}, onChange=()=>{}, language='zh'}={}) {
  const languageCode = langCode(language);
  const document = globalThis.document;
  const trigger = document?.getElementById('appearance-trigger');
  const dialog = document?.getElementById('appearance-dialog');
  if (!trigger || !dialog) throw new Error('Appearance requires #appearance-trigger and #appearance-dialog.');
  trigger.type = 'button';
  trigger.classList.add('appearance-trigger');
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-controls','appearance-dialog');
  trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML = `<span class="appearance-trigger-dot" aria-hidden="true">${paletteIcon}</span><span class="appearance-trigger-name"></span><span class="appearance-trigger-chevron">${chevronIcon}</span>`;
  dialog.setAttribute('aria-labelledby','appearance-title');
  dialog.setAttribute('aria-describedby','appearance-description');
  dialog.innerHTML = renderThemePicker(languageCode);
  applyTheme(currentTheme(),{persist:false});
  updateThemePicker(currentTheme(),languageCode);

  function open() {
    updateThemePicker(currentTheme(),languageCode);
    if (!dialog.open) dialog.showModal();
    trigger.setAttribute('aria-expanded','true');
    // Start at the current choice; native dialog restores focus on close.
    dialog.querySelector('[aria-pressed="true"]')?.focus();
  }
  function close() { if (dialog.open) dialog.close(); }
  function handleClose() { trigger.setAttribute('aria-expanded','false'); }
  function handleDialogClick(event) {
    const choice = event.target.closest?.('[data-theme-choice]');
    if (choice && dialog.contains(choice)) {
      const {theme,persisted} = applyTheme(choice.dataset.themeChoice);
      updateThemePicker(theme,languageCode);
      const note = dialog.querySelector('.appearance-note');
      if (note) note.textContent = persisted ? copy[languageCode].note : copy[languageCode].storageError;
      if (!persisted) onStorageError();
      onChange(theme);
      return;
    }
    if (event.target.closest?.('[data-appearance-close]')) close();
  }
  trigger.addEventListener('click',open);
  dialog.addEventListener('click',handleDialogClick);
  dialog.addEventListener('close',handleClose);
  return {open,close,destroy() {
    trigger.removeEventListener('click',open);
    dialog.removeEventListener('click',handleDialogClick);
    dialog.removeEventListener('close',handleClose);
  }};
}
