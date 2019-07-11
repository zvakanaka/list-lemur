const { sendText } = require('./sendMail.js');
const sequentialPromiseAll = require('sequential-promise-all');

async function sendListings(listings, options) {
  await sequentialPromiseAll(
    _sendListing,
    [listings[0], options],
    listings.length,
    (argsHandle, _previousResponse, i) => {
      argsHandle[0] = listings[i];
    }
  );
  return true;
}

async function _sendListing(listing, options) {
  let didSendMail = false;
  if (!options.firstLook && !process.env.NO_SEND_MAIL) {
    const emailAddresses = options.sendTo.split(',');
    await sequentialPromiseAll(
      sendText,
      [[listing], emailAddresses[0]],
      emailAddresses.length,
      (argsHandle, _previousResponse, i) => {
        argsHandle[1] = emailAddresses[i];
      }
    );
    didSendMail = true;
  } else {
    if (process.env.NO_SEND_MAIL) console.log('MAIL IS OFF: re-enable by removing config var \'NO_SEND_MAIL\'');
  }
  console.log(`🚲 ${listing.title}, ${didSendMail ? '📨' : '✉'}`);
}

module.exports = sendListings;
