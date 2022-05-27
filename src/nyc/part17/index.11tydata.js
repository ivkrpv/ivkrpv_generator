const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part17').reverse(),
  eleventyNavigation: {
    key: 'nyc_17',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 17`,
    parent: 'nyc',
    order: 17
  }
}
