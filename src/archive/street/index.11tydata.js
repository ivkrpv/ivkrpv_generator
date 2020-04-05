const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('street').reverse(),
  eleventyNavigation: {
    key: 'street',
    title: `<span class="lcl" data-lcl="street">${locale[config.defaultLocale].street}</span>`,
    parent: 'archive',
    order: 1
  }
}
