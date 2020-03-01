const debug = require('debug')('saveListings');
const model = require('./db.js');

function saveListings(options, listings) {
  const insert = options.insert || true;
  debug('insert =', insert);

  const newListings = [];
  listings.forEach(listing => {
    const unwanted = (typeof options.unwantedWords === 'undefined'
      || options.unwantedWords === '') ? false : options.unwantedWords.split(',').some(unwantedWord => {
        return listing.title.toLowerCase().indexOf(unwantedWord.toLowerCase()) > -1;
    });
    const wanted = (typeof options.requiredWords === 'undefined'
      || options.requiredWords === '') ? true : options.requiredWords.split(',').some(requiredWord => {
        return listing.title.toLowerCase().indexOf(requiredWord.toLowerCase()) > -1;
    });
    if (insert === true && !unwanted && wanted) {
      const result = model.insertItem(listing, options.id);
      if (result === false) {
        // item exists 🚳
      } else {
        newListings.push(listing);
      }
    }
  }); // end listings forEach
  return newListings;
}

module.exports = saveListings;
