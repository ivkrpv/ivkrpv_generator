import gallery from './gallery';
import maps from './maps';
import prints from './prints';
import { loadLocalStorage, saveLocalStorage, getUrlParameter } from './utils';
import config from '../_data/config.json';
import locale from '../_data/locale.json';

$(function () {
  // Locale
  changeLocale();

  $('body').on('click', '.js-locale', () => {
    let currentLocale = loadLocalStorage('locale', config.defaultLocale);
    currentLocale = currentLocale === 'ru' ? 'en' : 'ru';

    saveLocalStorage('locale', currentLocale);

    changeLocale();
  });

  // Tooltips

  $('[data-toggle="tooltip"]').tooltip();

  // Save images protection
  if (!getUrlParameter('save')) {
    $('body').on('contextmenu', 'img', function () {
      return false;
    });
  }

  // Modules

  gallery();
  maps();
  prints();
});

function changeLocale() {
  const currentLocale = loadLocalStorage('locale', config.defaultLocale);

  $('.lcl').each((i, el) => {
    const $el = $(el);
    const key = $el.data('lcl');
    const attr = $el.data('lcl-attr');
    const resources = locale[currentLocale];

    if (resources) {
      const text = resources[key];

      if (text) {
        if (attr) {
          $el.attr(attr, text);
        } else {
          $el.html(text);
        }
      }
    }
  });
}
