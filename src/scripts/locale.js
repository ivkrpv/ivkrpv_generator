import { loadLocalStorage, saveLocalStorage, getDescendantProp, documentReady } from './utils';
import config from '../_data/config.json';
import locale from '../_data/locale.json';

let { defaultLocale } = config;

documentReady(function () {
  if (!loadLocalStorage('locale')) {
    const browserLang = navigator && (navigator.language || navigator.userLanguage);

    if (browserLang) {
      if (
        browserLang.startsWith('ru') ||
        browserLang.startsWith('be') ||
        browserLang.startsWith('uk') ||
        browserLang.startsWith('kk')
      ) {
        defaultLocale = 'ru';
      } else {
        defaultLocale = 'en';
      }
    }

    saveLocalStorage('locale', defaultLocale);
  }

  translatePage();

  document.querySelector('.js-locale').addEventListener('click', () => {
    const currentLocale = loadLocalStorage('locale', defaultLocale);

    saveLocalStorage('locale', currentLocale === 'ru' ? 'en' : 'ru');
    translatePage();
  });
});

function translatePage() {
  const currentLocale = loadLocalStorage('locale', defaultLocale);
  const strings = locale[currentLocale];

  if (strings) {
    document.querySelectorAll('.lcl').forEach((el) => {
      const key = el.dataset.lcl;
      const attr = el.dataset.lclAttr;
      const text = getDescendantProp(strings, key);

      if (text) {
        if (attr) {
          el.setAttribute(attr, text);
        } else {
          el.innerHTML = text;
        }
      }
    });
  }
}
