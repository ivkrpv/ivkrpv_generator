import 'lightgallery.js';
import { shuffleArray, documentReady } from './utils';

documentReady(function () {
  initSlideshow(); // home page
  initGallery(); // classic
  initPopupGallery(); // nyc map
  initQuickGallery(); // west coast page
});

function getElIndex(el) {
  if (!el) return -1;
  var i = 0;
  while ((el = el.previousElementSibling)) {
    i++;
  }
  return i;
}

function initSlideshow() {
  const $slideshow = $('.slideshow');

  if ($slideshow.length) {
    const images = $slideshow.children().toArray();

    $slideshow.empty();

    shuffleArray(images);

    images.forEach((img) => $slideshow.append(img));

    $slideshow.children().last().show();

    setInterval(function () {
      $slideshow.children().last().prev().show();

      $slideshow
        .children()
        .last()
        .fadeOut(2000, function () {
          $(this).prependTo($slideshow);
        });
    }, 5000);
  }
}

function initGallery() {
  const gallery = $('.gallery');

  if (gallery.length) {
    lightGallery(gallery.get(0), { selector: 'a', download: false, hideBarsDelay: 2000 });
  }
}

function initPopupGallery() {
  $('body').on('click', '.popup-gallery-images', function (e) {
    e.stopPropagation();

    const $images = $(this);

    $images.on('onCloseAfter.lg', ({ target }) => {
      const lg = window.lgData[target.getAttribute('lg-uid')];

      if (lg) {
        lg.destroy(true);
      }
    });

    lightGallery($images.get(0), {
      dynamic: true,
      dynamicEl: $images
        .children()
        .map((i, { src }) => ({ src }))
        .get(),
      download: false,
      hideBarsDelay: 2000,
    });
  });

  $('body').on('click', '.popup-gallery-prev', function ({ target }) {
    const $images = $(target).closest('.popup-gallery').children('.popup-gallery-images');

    $images.prepend($images.children().last());
  });

  $('body').on('click', '.popup-gallery-next', function ({ target }) {
    const $images = $(target).closest('.popup-gallery').children('.popup-gallery-images');

    $images.append($images.children().first());
  });
}

function initQuickGallery() {
  const galleryImages = document.querySelectorAll('.js-quick-gallery img');

  galleryImages.forEach((img) => {
    img.addEventListener('click', function (e) {
      e.stopPropagation();

      const gallery = this.parentNode;

      gallery.addEventListener('onCloseAfter', ({ target }) => {
        const lg = window.lgData[target.getAttribute('lg-uid')];

        if (lg) {
          lg.destroy(true);
        }
      });

      lightGallery(gallery, {
        dynamic: true,
        dynamicEl: [...gallery.children].map(({ src }) => ({ src })),
        index: getElIndex(this),
        download: false,
        hideBarsDelay: 2000,
      });
    });
  });
}
