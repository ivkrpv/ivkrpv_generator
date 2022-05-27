const config = require('../_data/config.json');
const locale = require('../_data/locale.json');

module.exports = {
  eleventyNavigation: {
    key: 'westcoast',
    title: `<i class="fas fa-tree"></i>&nbsp;&nbsp;<span class="js-lcl" data-lcl="wc.menu">${
      locale[config.defaultLocale].wc.menu
    }</span>`,
    order: 8,
  },
};
