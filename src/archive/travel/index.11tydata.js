const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('travel').reverse(),
  eleventyNavigation: {
    key: 'travel',
    title: `<span class="js-lcl" data-lcl="travel">${locale[config.defaultLocale].travel}</span>`,
    parent: 'archive',
    order: 2
  }
}
