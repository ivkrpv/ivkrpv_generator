const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('nyc-part3').reverse(),
  eleventyNavigation: {
    key: 'nyc_3',
    title: `<span class="js-lcl" data-lcl="part">${locale[config.defaultLocale].part}</span> 3`,
    parent: 'nyc',
    order: 3
  }
}
