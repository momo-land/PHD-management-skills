'use strict';
// Apply before styles paint; theme preferences stay in this browser only.
try {
  const savedTheme = localStorage.getItem('phd-theme');
  if (['sage', 'ocean', 'paper', 'midnight', 'studio', 'iris'].includes(savedTheme)) document.documentElement.dataset.theme = savedTheme;
} catch { /* Restricted storage still permits changing the current view. */ }

// Set the document language before the interface loads.
{
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('phd-language'); } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  const language = [requested, savedLanguage].find(value => ['zh', 'en'].includes(value)) || 'zh';
  document.documentElement.lang = language === 'en' ? 'en-US' : 'zh-CN';
}
