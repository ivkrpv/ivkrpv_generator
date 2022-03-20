function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch (e) {
    return false;
  }
}

export function loadLocalStorage(key, fallbackValue) {
  if (supportsLocalStorage()) {
    const value = window.localStorage.getItem(key);

    return value || fallbackValue;
  }

  return fallbackValue;
}

export function saveLocalStorage(key, value) {
  if (supportsLocalStorage()) {
    window.localStorage.setItem(key, value);
  }
}

export function getUrlParameter(param) {
  var pageURL = decodeURIComponent(window.location.search.substring(1)),
    urlVariables = pageURL.split('&'),
    parameterName,
    i;

  for (i = 0; i < urlVariables.length; i++) {
    parameterName = urlVariables[i].split('=');

    if (parameterName[0] === param) {
      return parameterName[1] === undefined ? true : parameterName[1];
    }
  }
}

export function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function documentReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
