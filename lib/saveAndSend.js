const debug = require('debug')('saveAndSend');
const sendMail = require('./sendMail.js');
const model = require('./db.js');

function saveAndSend(options, listings) {
  const insert = options.insert || true;
  debug('insert =', insert);
  const sendMessage = !options.firstLook;

  return new Promise(function(resolve, reject) {
    listings.forEach(listing => {
      const unwanted = (typeof options.unwantedWords === 'undefined'
        || options.unwantedWords === '') ? false : options.unwantedWords.split(',').some(unwantedWord => {
          return listing.title.toLowerCase().indexOf(unwantedWord.toLowerCase()) > -1;
      });
      const wanted = (typeof options.requiredWords === 'undefined'
        || options.requiredWords === '') ? true : options.unwantedWords.split(',').some(requiredWord => {
          return listing.title.toLowerCase().indexOf(requiredWord.toLowerCase()) > -1;
      });
      if (insert === true && !unwanted && wanted) {
        const result = model.insertItem(listing);
        if (result === false) {
          // item exists 🚳
        } else {
          let didSendMail = false;
          if (sendMessage === true && !process.env.NO_SEND_MAIL) {
            try {
              options.sendTo.split(',').forEach(emailAddress => {
                sendMail.sendText([listing], emailAddress)
                  .then(message => {
                    // sent message
                  })
                  .catch(e => {
                    console.error('sendMail:', e);
                  });
              });
            } catch (e) {
              console.error('Mail Error', e);
            }
            didSendMail = true;
          } else {
            if (process.env.NO_SEND_MAIL) console.log('MAIL IS OFF: re-enable by removing config var \'NO_SEND_MAIL\'');
          }
          console.log(`🚲 ${listing.title}, ${didSendMail ? '📨' : '✉'}`);
        }
      }
    }); // end listings forEach
  }); // end new Promise
}

module.exports = saveAndSend;
