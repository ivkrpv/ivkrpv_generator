import 'lightgallery.js';
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

  // Slideshow
  const $slideshow = $('.slideshow');

  if ($slideshow.length) {
    const images = $slideshow.children().toArray();

    $slideshow.empty();

    shuffle(images);

    images.forEach(img => $slideshow.append(img));

    $slideshow.children().last().show();

    setInterval(function () {
      $slideshow.children().last().prev().show();

      $slideshow.children().last().fadeOut(2000, function () {
        $(this).prependTo($slideshow);
      });
    }, 5000);
  }

  // Gallery
  const gallery = $('.gallery');

  if (gallery.length) {
    lightGallery(gallery.get(0), { selector: 'a', download: false, hideBarsDelay: 2000 });
  }

  // Prints
  const prints$ = $('#prints');
  const printsTags$ = $('#printsTags');
  const printOrder = {
    url: null,
    frame: 'dark',
    size: '61x91',
    email: null,
    contact: null,
  };

  $('body').on('click', '.print-frame-thumb', function () {
    printsTags$.hide();
    $(this).removeClass('print-frame-thumb').siblings().hide();
    $('.js-print-dashboard').toggleClass('d-none d-flex');

    printOrder.url = $(this).find('img').prop('src');
  });

  $('body').on('click', '.js-print-cancel', function () {
    printsTags$.show();
    $('.print-frame').addClass('print-frame-thumb');
    prints$.children().show();
    $('.js-print-dashboard').toggleClass('d-none d-flex');

    // clear print order url
    printOrder.url = null;

    // clear invalid order form fields
    $('.js-print-order-form .form-control:invalid').val('');
    $('.js-print-order-form').removeClass('was-validated');
  });

  $('body').on('click', '.js-print-frame', function (e) {
    const $btn = $(e.currentTarget);
    const color = $btn.data('color'); // light or dark

    $('.print-frame').removeClass('print-frame-light print-frame-dark').addClass('print-frame-' + color);

    printOrder.frame = color;
  });

  $('body').on('click', '.js-print-bg', function (e) {
    const $btn = $(e.currentTarget);
    const color = $btn.data('color'); // any bootstrap color
    const darkText = color === 'light' || color === 'warning';
    const textColor = darkText ? 'dark' : 'white';
    const navbarBg = darkText ? 'light' : 'dark';
    const likelyColor = darkText ? 'light' : 'dark';

    $('body')
      .removeClass(function (index, className) {
        return (className.match(/(^|\s)bg-\S+/g) || []).join(' ');
      })
      .addClass('bg-' + color);

    $('body').removeClass('text-white text-dark').addClass('text-' + textColor);
    $('.navbar').removeClass('navbar-light navbar-dark').addClass('navbar-' + navbarBg);
    $('.likely').removeClass('likely-light likely-dark').addClass('likely-' + likelyColor);
  });

  $('body').on('change', '.js-print-size input[type=radio][name=size]', function () {
    printOrder.size = $(this).val();

    $('.js-print-price').children().addClass('d-none');
    $(`.js-print-price [data-lcl=price${printOrder.size}]`).removeClass('d-none');
  });

  $('body').on('click', '.js-print-order', function () {
    $('.js-print-order-form').submit();
  });

  $('body').on('submit', '.js-print-order-form', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $form = $(this);

    $form.addClass('was-validated');

    if (this.checkValidity() !== false) {
      $form.serializeArray().forEach(f => {
        printOrder[f.name] = f.value;
      });

      toggleModalLoading(true);

      $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbxC1Z2rtuymmvZt0J6si52IqNe_qlduBbplSxxXcDtnQvLrAW0/exec',
        method: "GET",
        dataType: "json",
        data: printOrder,
        success: function () {
          toggleModalLoading(false);

          $('#newOrderSuccess').removeClass('d-none').toast({
            delay: 3000,
          }).toast('show');
        },
        error: function () {
          toggleModalLoading(false);

          $('#newOrderError').removeClass('d-none').toast({
            delay: 3000,
          }).toast('show');
        },
      })
    }
  });

  function toggleModalLoading(loading) {
    if (loading) {
      $('.js-print-order').prop('disabled', true).children('.spinner-border').removeClass('d-none');
    } else {
      $('.js-print-order').prop('disabled', false).children('.spinner-border').addClass('d-none');
      $('#newOrderModal').modal('hide');
    }
  }
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

function loadLocalStorage(key, fallbackValue) {
  if (supportsLocalStorage()) {
    const value = window.localStorage.getItem(key);

    return value || fallbackValue;
  }

  return fallbackValue;
};

function saveLocalStorage(key, value) {
  if (supportsLocalStorage()) {
    window.localStorage.setItem(key, value);
  }
};

function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch (e) {
    return false;
  }
};

function getUrlParameter(param) {
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
};

function shuffle(array) {
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
