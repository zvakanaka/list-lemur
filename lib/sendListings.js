const { sendText } = require('./sendMail.js');
const sequentialPromiseAll = require('sequential-promise-all');
const debug = require('debug')('sendListings');

async function sendListings(listings, options) {
  const emailAddresses = options.sendTo.split(',');
  debug(`${listings.length} new listings`);
  const emailsToSend = emailAddresses.reduce((acc, cur) => {
    listings.forEach(listing => {
      acc.push({listing, email: cur});
    });
    return acc;
  }, []);
  debug(`${emailsToSend.length} emailsToSend`);
  try {
    const emailResponses = await sequentialPromiseAll(
      _sendListing,
      [emailsToSend[0].listing, emailsToSend[0].email, options],
      emailsToSend.length,
      (argsHandle, _previousResponse, i) => {
        argsHandle[0] = emailsToSend[i].listing;
        argsHandle[1] = emailsToSend[i].email;
      });
    emailResponses.forEach((emailResponse, i) => {
      debug(`${i}: ${emailsToSend[i].email} ${emailResponse === 'email sent' ? '📨' : '✉'}  ${emailsToSend[i].listing.title}`);
    });
  } catch (e) {
    console.error(e);
  }
  return true;
}

async function _sendListing(listing, email, options) {
  if (!options.firstLook && !process.env.NO_SEND_MAIL) {
    await sendText([listing], email);
    return 'email sent';
  }
  if (process.env.NO_SEND_MAIL) console.log('MAIL IS OFF: re-enable by removing config var \'NO_SEND_MAIL\'');
  return 'email not sent';
}

module.exports = sendListings;
