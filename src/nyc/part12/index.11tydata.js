const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part12').reverse(),
  eleventyNavigation: {
    key: 'nyc_12',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 12`,
    parent: 'nyc',
    order: 12
  }
}
