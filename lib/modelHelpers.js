const debug = require('debug')('lemur');
const model = require('./db.js');
const { getBodies } = require('body-snatchers');
const sendListings = require('./sendListings.js');
const sendMail = require('./sendMail');
const look = require('./look.js');
const saveListings = require('./saveListings.js');
const sequentialPromiseAll = require('sequential-promise-all');
const rssToHtml = require('./rssToHtml')
const cj = require('color-json');

function isValidLink (link) {
  // https://stackoverflow.com/a/17773849/4151489
  // (https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})
  return true;
}

function isValidEmail (email) {
  return true;
}

function getStripe (link) {
  const allStripes = model.getAllStripes();
  const existingStripe = allStripes.find(stripe => link.startsWith(stripe.prefix));
  return existingStripe;
}

async function sendCode (email, userId) {
  const unverifiedEmailToInsert = { userId, email };
  const code = model.insertVerifiedEmail(unverifiedEmailToInsert);
  await sendMail.sendVerificationEmail(code, unverifiedEmailToInsert.email);
  return true;
}

function isValidCode (userId, code) {
  const verified = model.verifyEmail(userId, code);
  return verified;
}

function getAllActiveWatches () {
  const allActiveWatches = model.getAllWatches().filter(watch => !watch.archived)
    .map(watch => { // attach selectors and js of coresponding stripe to each watch
      const matchingStripe = getStripe(watch.url);
if (!matchingStripe){
 console.log(`stripe not found for: ${JSON.stringify(watch,null,2)}`)
return {}
}
      const matchingVerifiedEmail = model.getVerifiedEmail(watch.userId);
      const watchClone = Object.assign({}, {
        selectors: matchingStripe.selectors,
        javascript: matchingStripe.javascript,
        rss: matchingStripe.rss,
        sendTo: watch.sendToOverride || matchingVerifiedEmail
      }, watch);
      return watchClone;
    })
    .filter(watch => watch.sendTo);

  return allActiveWatches;
}

function getAllWatchesForUser (userId) {
  const allWatches = model.getAllWatches()
    .filter(watch => watch.userId === userId)
    .map(watch => {
      return {
        url: watch.url,
        watchName: watch.watchName,
        unwantedWords: watch.unwantedWords,
        requiredWords: watch.requiredWords,
        creationDate: watch.creationDate,
        archived: watch.archived,
        id: watch.id
      };
    });

  return allWatches;
}

function cjl (json) {
  debug(cj(json));
}
// pop last item off all watches for a user
function _popItem (watchId) {
  const itemsForWatch = model.getAllItemsForWatch(watchId);
  const mostRecentItem = itemsForWatch.sort((a, b) => a.creationDate < b.creationDate)[0];
  model.removeItem(mostRecentItem.id);
}
function popItems (userId) {
  const userWatches = getAllWatchesForUser(userId);
  userWatches.forEach(watch => {
    _popItem(watch.id);
  });
}

async function watch (watches) {
  const bodies = await getBodies(watches);
  debug(`about to watch ${watches.length} watches`);
  await sequentialPromiseAll(
    _watchSite,
    [watches[0], bodies[0]],
    watches.length,
    (
      argsHandle,
      _previousResponse,
      i
    ) => {
      argsHandle[0] = watches[i];
      argsHandle[1] = bodies[i];
      const hostname = (new URL(watches[i].url)).hostname;
      console.log(`Looking at ${hostname} for ${watches[i].watchName}`);
    });
}

async function _watchSite (options, body) {
  try {
    cjl(options);
    const rssHtml = options.rss ? await rssToHtml(body) : ''
    const lookResults = await look(options, options.rss ? rssHtml : body);
    console.log(`Got listings from -> ${lookResults.url}`);
    const newListings = saveListings(options, lookResults.listings);
    if (newListings.length > 0) {
      await sendListings(newListings, options);
    }
    debug(`returning results: ${cj(newListings)}`);
    return newListings;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  isValidLink,
  isValidEmail,
  isValidCode,
  sendCode,
  getStripe,
  getAllActiveWatches,
  getAllWatchesForUser,
  popItems,
  watch
};
