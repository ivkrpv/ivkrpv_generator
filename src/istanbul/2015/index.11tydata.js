const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');
const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('ist-2015').reverse(),
  eleventyNavigation: {
    key: 'ist_2015',
    title: `<span class="lcl" data-lcl="ist2015Desc">${locale[config.defaultLocale].ist2015Desc}</span>`,
    parent: 'ist',
    order: 1
  }
}
