const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part19').reverse(),
  eleventyNavigation: {
    key: 'nyc_19',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 19`,
    parent: 'nyc',
    order: 19
  }
}
