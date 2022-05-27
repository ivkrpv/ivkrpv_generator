const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('people').reverse(),
  eleventyNavigation: {
    key: 'people',
    title: `<span class="js-lcl" data-lcl="people">${locale[config.defaultLocale].people}</span>`,
    parent: 'archive',
    order: 3
  }
}
