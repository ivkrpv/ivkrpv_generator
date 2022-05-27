const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('south-coast').reverse(),
  eleventyNavigation: {
    key: 'south_coast',
    title: `<span class="js-lcl" data-lcl="southCoast">${locale[config.defaultLocale].southCoast}</span>`,
    parent: 'south',
    order: 3
  }
}
