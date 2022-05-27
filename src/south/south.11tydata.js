const config = require('../_data/config.json');
const locale = require('../_data/locale.json');

module.exports = {
  eleventyNavigation: {
    key: 'south',
    title: `<i class="fas fa-mountain"></i>&nbsp;&nbsp;<span class="js-lcl" data-lcl="south">${locale[config.defaultLocale].south}</span>`,
    order: 5
  }
}
