const imageGallery = require('./imageGallery');

module.exports = {
  images: () => imageGallery.getAllImagesInFolder('slideshow')
}
