const config = require('../_data/config.json');
const locale = require('../_data/locale.json');

module.exports = {
  eleventyNavigation: {
    key: 'contact',
    title: `<span class="lcl" data-lcl="contact">${locale[config.defaultLocale].contact}</span>`,
    order: 1
  }
}
