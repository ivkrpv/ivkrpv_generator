const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part14').reverse(),
  eleventyNavigation: {
    key: 'nyc_14',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 14`,
    parent: 'nyc',
    order: 14
  }
}
