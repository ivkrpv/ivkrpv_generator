const imageGallery = require('../../imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('south-404').reverse(),
  eleventyNavigation: {
    key: 'south_404',
    title: '404',
    parent: 'south',
    order: 2
  }
}
