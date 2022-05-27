const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part18').reverse(),
  eleventyNavigation: {
    key: 'nyc_18',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 18`,
    parent: 'nyc',
    order: 18
  }
}
