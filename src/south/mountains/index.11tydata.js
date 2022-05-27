const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('south-mountains').reverse(),
  eleventyNavigation: {
    key: 'south_mountains',
    title: `<span class="js-lcl" data-lcl="southMountains">${locale[config.defaultLocale].southMountains}</span>`,
    parent: 'south',
    order: 1
  }
}
