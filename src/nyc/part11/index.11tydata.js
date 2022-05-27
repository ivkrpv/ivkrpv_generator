const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part11').reverse(),
  eleventyNavigation: {
    key: 'nyc_11',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 11`,
    parent: 'nyc',
    order: 11
  }
}
