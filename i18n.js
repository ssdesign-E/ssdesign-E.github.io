/**
 * SS Engineering — i18n engine
 * Поддерживаемые языки: ru | en | tk
 * Использование: data-i18n="ключ.вложенный_ключ"
 *                data-i18n-placeholder="ключ"
 *                data-i18n-html="ключ"   ← для тегов внутри текста (<span> и т.п.)
 */

const I18n = (() => {

  const SUPPORTED = ['ru', 'en', 'tk'];
  const DEFAULT   = 'ru';
  const LS_KEY    = 'ss_lang';

  let _lang = DEFAULT;
  let _t    = {};

  /* ── определить язык при старте ── */
  function detectLang() {
    const saved    = localStorage.getItem(LS_KEY);
    const browser  = (navigator.language || '').slice(0, 2).toLowerCase();
    if (saved && SUPPORTED.includes(saved))   return saved;
    if (SUPPORTED.includes(browser))          return browser;
    return DEFAULT;
  }

  /* ── загрузить JSON ── */
  async function loadTranslations(lang) {
    const res  = await fetch(`i18n/${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`i18n: cannot load ${lang}.json`);
    return res.json();
  }

  /* ── получить значение по "секция.ключ" ── */
  function get(dotPath) {
    const parts = dotPath.split('.');
    let val = _t;
    for (const p of parts) {
      if (val == null) return dotPath;
      val = val[p];
    }
    return val ?? dotPath;
  }

  /* ── применить переводы к DOM ── */
  function applyToDOM() {
    /* обычный текст */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = get(el.dataset.i18n);
    });

    /* innerHTML (позволяет <span> внутри заголовков) */
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = get(el.dataset.i18nHtml);
    });

    /* placeholder у input / textarea */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = get(el.dataset.i18nPlaceholder);
    });

    /* select option: data-i18n-option */
    document.querySelectorAll('[data-i18n-option]').forEach(el => {
      el.textContent = get(el.dataset.i18nOption);
    });

    /* lang на <html> и dir */
    document.documentElement.lang = _lang;
    document.documentElement.dir  = 'ltr'; // все три языка — LTR

    /* активная кнопка в switcher */
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === _lang);
    });
  }

  /* ── публичный метод смены языка ── */
  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT;
    _lang = lang;
    localStorage.setItem(LS_KEY, lang);
    _t = await loadTranslations(lang);
    applyToDOM();
  }

  /* ── инициализация ── */
  async function init() {
    const lang = detectLang();
    await setLang(lang);
  }

  return { init, setLang, get, current: () => _lang };

})();

/* ── запуск после загрузки DOM ── */
document.addEventListener('DOMContentLoaded', () => I18n.init());
