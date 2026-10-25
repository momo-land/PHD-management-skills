import views from './locales/en-views.mjs';
import dialogs from './locales/en-dialogs.mjs';
import shell from './locales/en-shell.mjs';

export const english = Object.freeze({ ...views, ...dialogs, ...shell });
export function resolveLanguage({ requested, saved } = {}) {
  return [requested, saved].find(value => value === 'zh' || value === 'en') || 'zh';
}
function initialLanguage() {
  let saved;
  try { saved = globalThis.localStorage?.getItem('phd-language'); } catch { /* Private storage is optional. */ }
  const requested = globalThis.location ? new URLSearchParams(location.search).get('lang') : null;
  return resolveLanguage({ requested, saved });
}
let language = initialLanguage();
export const lang = () => language;
export const locale = () => language === 'en' ? 'en-US' : 'zh-CN';
export function translate(source, params = {}, target = language) {
  const template = target === 'en' ? english[source] ?? source : source;
  return String(template).replace(/\{([A-Za-z][\w]*)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match);
}
export const t = translate;
export function setLanguage(value) {
  language = resolveLanguage({ requested: value });
  try { localStorage.setItem('phd-language', language); return true; } catch { return false; }
}
export function localizeSkill(skill, target = language) {
  if (target !== 'en' || !skill.en) return skill;
  return { ...skill, ...skill.en, id: skill.id, path: `skills/${skill.id}/SKILL.en.md` };
}
