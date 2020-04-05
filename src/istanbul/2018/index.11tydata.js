const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('ist-2018').reverse(),
  eleventyNavigation: {
    key: 'ist_2018',
    title: `<span class="lcl" data-lcl="ist2018Desc">${locale[config.defaultLocale].ist2018Desc}</span>`,
    parent: 'ist',
    order: 2
  }
}
