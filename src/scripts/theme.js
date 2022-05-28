import { loadLocalStorage, saveLocalStorage, documentReady } from './utils';

const STORAGE_KEY = 'theme';
export const EVENT_NAME = 'theme:change';

const themeAuto = document.getElementById('theme-auto');
const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');

documentReady(function () {
  const theme = loadLocalStorage(STORAGE_KEY, 'auto');

  switch (theme) {
    case 'light':
      turnLight();

      break;
    case 'dark':
      turnDark();

      break;
    case 'auto':
    default:
      turnAuto();

      break;
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const theme = loadLocalStorage(STORAGE_KEY, 'auto');

    switch (theme) {
      case 'light':
        turnDark();

        break;
      case 'dark':
        turnAuto();

        break;
      case 'auto':
      default:
        turnLight();

        break;
    }
  });

  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');

  darkMedia.addEventListener('change', (e) => {
    const theme = loadLocalStorage(STORAGE_KEY, 'auto');

    if (theme === 'auto') {
      document.documentElement.className = e.matches ? 'dark' : '';

      const event = new CustomEvent(EVENT_NAME, { detail: { isDark: e.matches } });

      document.body.dispatchEvent(event);
    }
  });
});

function turnAuto() {
  saveLocalStorage(STORAGE_KEY, 'auto');

  themeAuto.className = 'block';
  themeLight.className = 'hidden';
  themeDark.className = 'hidden';

  const isDark = isDarkTheme();

  document.documentElement.className = isDark ? 'dark' : '';

  const event = new CustomEvent(EVENT_NAME, { detail: { isDark } });

  document.body.dispatchEvent(event);
}

function turnLight() {
  saveLocalStorage(STORAGE_KEY, 'light');

  themeLight.className = 'block';
  themeDark.className = 'hidden';
  themeAuto.className = 'hidden';

  document.documentElement.className = '';

  const event = new CustomEvent(EVENT_NAME, { detail: { isDark: false } });

  document.body.dispatchEvent(event);
}

function turnDark() {
  saveLocalStorage(STORAGE_KEY, 'dark');

  themeDark.className = 'block';
  themeAuto.className = 'hidden';
  themeLight.className = 'hidden';

  document.documentElement.className = 'dark';

  const event = new CustomEvent(EVENT_NAME, { detail: { isDark: true } });

  document.body.dispatchEvent(event);
}

export function isDarkTheme() {
  const theme = loadLocalStorage(STORAGE_KEY, 'auto');

  if (theme === 'auto') {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');

    return darkMedia.matches;
  }

  return theme === 'dark';
}
