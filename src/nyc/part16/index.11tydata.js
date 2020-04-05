const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part16').reverse(),
  eleventyNavigation: {
    key: 'nyc_16',
    title: `<span class="lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 16`,
    parent: 'nyc',
    order: 16
  }
}
