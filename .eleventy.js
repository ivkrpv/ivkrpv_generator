const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');
const config = require('./src/_data/config.json');
const locale = require('./src/_data/locale.json');

function getDescendantProp(obj, desc) {
  const arr = desc.split('.');

  while (arr.length && (obj = obj[arr.shift()]));

  return obj;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/favicon': '/' });
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/webfonts');

  eleventyConfig.addPassthroughCopy({
    'node_modules/mapbox-gl/dist/mapbox-gl.css': 'styles/mapbox-gl.css',
  });

  // lightgallery
  eleventyConfig.addPassthroughCopy({
    'node_modules/lightgallery.js/dist/css/lightgallery.min.css': 'styles/lightgallery.min.css',
  });
  eleventyConfig.addPassthroughCopy({ 'node_modules/lightgallery.js/dist/img': 'img' });
  eleventyConfig.addPassthroughCopy({ 'node_modules/lightgallery.js/dist/fonts': 'fonts' });

  eleventyConfig.addPassthroughCopy('src/scripts/jquery-3.1.1.min.js');
  eleventyConfig.addPassthroughCopy('src/scripts/bootstrap.bundle.min.js');

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(lazyImagesPlugin, {
    imgSelector: '.gallery img, #prints img, #map-wc-content img',
    preferNativeLazyLoad: false,
    transformImgPath: (imgPath) => {
      if (imgPath.startsWith('/') && !imgPath.startsWith('//')) {
        return `./src${imgPath}`;
      }

      return imgPath;
    },
  });

  eleventyConfig.addNunjucksFilter('isActivePage', function (navPage, page) {
    return (
      navPage.url === page.url ||
      (navPage.children.length && navPage.children.some((p) => p.url === page.url))
    );
  });

  eleventyConfig.addNunjucksShortcode('defaultLocale', function (config, locale, key) {
    return getDescendantProp(locale[config.defaultLocale], key);
  });

  eleventyConfig.addHandlebarsShortcode('defaultLocale', function (key) {
    return getDescendantProp(locale[config.defaultLocale], key);
  });

  // new function that also wraps the text
  eleventyConfig.addHandlebarsShortcode('locale', function (key) {
    const text = getDescendantProp(locale[config.defaultLocale], key);

    return `<span class="js-lcl" data-lcl="${key}">${text}</span>`;
  });

  eleventyConfig.addHandlebarsShortcode('arr', (...args) => args.slice(0, -1));

  return {
    dir: { input: 'src', output: 'dist', data: '_data' },
    passthroughFileCopy: true,
    templateFormats: ['hbs', 'njk', 'md', 'css', 'html', 'yml'],
    htmlTemplateEngine: 'njk',
  };
};
