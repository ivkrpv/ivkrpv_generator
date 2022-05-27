const config = require('../_data/config.json');
const locale = require('../_data/locale.json');

module.exports = {
  eleventyNavigation: {
    key: 'ist',
    title: `<i class="fas fa-mosque"></i>&nbsp;&nbsp;<span class="js-lcl" data-lcl="istanbul">${locale[config.defaultLocale].istanbul}</span>`,
    order: 6
  }
}
