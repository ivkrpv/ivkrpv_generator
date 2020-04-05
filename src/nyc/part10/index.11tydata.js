const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part10').reverse(),
  eleventyNavigation: {
    key: 'nyc_10',
    title: `<span class="lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 10`,
    parent: 'nyc',
    order: 10
  }
}
