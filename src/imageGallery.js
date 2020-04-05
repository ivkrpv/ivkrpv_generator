const path = require('path');
const fs = require('fs');
const junk = require('junk');

module.exports = {
  getAllImagesInFolder(subdirname) {
    const directoryPath = path.join(__dirname, 'images', 'photography', subdirname);

    try {
      const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });

      const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

      return dirents
        .filter(de => de.isFile() && junk.not(de.name))
        .sort((a, b) => collator.compare(a.name, b.name))
        .map(({ name }) => {
          const url = path.join('/images', 'photography', subdirname, name);

          return {
            url,
            name,
          };
        });
    } catch (error) {
      console.log('Unable to scan directory: ' + error);

      return [];
    }
  },
}
