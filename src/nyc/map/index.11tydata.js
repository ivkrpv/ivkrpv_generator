const config = require('../../_data/config.json');
const locale = require('../../_data/locale.json');

module.exports = {
  eleventyNavigation: {
    key: 'nyc_map',
    title: `<span class="js-lcl" data-lcl="map">${locale[config.defaultLocale].map}</span>`,
    parent: 'nyc',
    order: 21
  }
}
