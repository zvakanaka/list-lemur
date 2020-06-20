const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const getCode = require('./getCode');
const debug = require('debug')('db');

const adapter = new FileSync(process.env.DB_FILE || './db.json');
const db = low(adapter);

db._.mixin(lodashId);
try {
  const presets = require('../presetStripes.json');
  const presetStripes = presets.map(preset => Object.assign({}, {
    creationDate: Date.now(),
    createdBy: 1,
    modifiedDate: Date.now(),
    modifiedBy: 1,
    archived: false,
    id: 1
  }, preset));
  db.defaults({ items: [], users: [], verifiedEmails: [], stripes: [...presetStripes], watches: [], supportRequests: [] })
    .write();
} catch (e) {
  console.warn('WARN: You may want to set up the `presetStripes.json` file (see README)');
  db.defaults({ items: [], users: [], verifiedEmails: [], stripes: [], watches: [], supportRequests: [] })
    .write();
}

/* STRIPES */
function getAllStripes (link) {
  const allStripes = db.get('stripes')
    .filter({ archived: false })
    .value();
  return allStripes;
}

/* WATCHES */
function insertWatch (watch) {
  const creationDate = Date.now();
  const watchToInsert = {
    url: watch.url,
    stripeId: watch.stripeId,
    watchName: watch.watchName || watch.url,
    userId: watch.userId,
    unwantedWords: watch.unwantedWords || '',
    requiredWords: watch.requiredWords || '',
    creationDate,
    archived: false,
    deleted: false
  };
  db.defaults({ watches: [] })
    .get('watches')
    .insert(watchToInsert)
    .write();
  return db.get('watches')
    .filter({ userId: watchToInsert.userId, creationDate })
    .value()[0];
}

function updateWatch (watch) {
  try {
    db.get('watches')
      .find({ id: watch.id })
      .assign({ watchName: watch.name, url: watch.url, archived: watch.archived, deleted: watch.deleted })
      .write();
  } catch (e) {
    console.error(e);
  }
}

function getAllWatches () {
  const allWatches = db.get('watches')
    .filter(watch => watch.deleted !== true)
    .value();
  return allWatches;
}

/* VERIFIED EMAILS */
function insertVerifiedEmail (verifiedEmail) {
  const code = getCode();
  const creationDate = Date.now();
  const verifiedEmailToInsert = {
    userId: verifiedEmail.userId,
    email: verifiedEmail.email,
    code,
    tryCount: 0,
    verified: false,
    creationDate,
    archived: false
  };
  db.defaults({ verifiedEmails: [] })
    .get('verifiedEmails')
    .insert(verifiedEmailToInsert)
    .write();
  return db.get('verifiedEmails')
    .filter({ userId: verifiedEmailToInsert.userId, creationDate })
    .value()[0].code;
}

function getVerifiedEmail (userId) {
  const verifiedEmailsArr = db.get('verifiedEmails')
    .filter({ archived: false, verified: true, userId })
    .value();
  if (verifiedEmailsArr && verifiedEmailsArr.length > 0) return verifiedEmailsArr[0].email;
}

function archiveVerifiedEmail (userId) {
  db.get('verifiedEmails')
    .find({ archived: false, verified: true, userId })
    .assign({ archived: true, modifiedDate: Date.now() })
    .write();
}

function verifyEmail (userId, code) {
  const unverifiedEmailTryCount = db.get('verifiedEmails')
    .filter({ userId, archived: false })
    .value()[0].tryCount;
  if (unverifiedEmailTryCount > 3) return false;

  db.get('verifiedEmails')
    .find({ userId, code, archived: false })
    .assign({ verified: true, tryCount: unverifiedEmailTryCount + 1, modifiedDate: Date.now() })
    .write();

  const didVerifyEmail = db.get('verifiedEmails')
    .filter({ userId, code, verified: true, archived: false })
    .value();
  if (didVerifyEmail.length > 0) {
    return true;
  } else {
    const unverifiedEmail = db.get('verifiedEmails')
      .filter({ userId, archived: false })
      .value()[0];

    const tryCount = unverifiedEmail.tryCount + 1;
    db.get('verifiedEmails')
      .find({ userId, archived: false })
      .assign({ tryCount, modifiedDate: Date.now() })
      .write();
    return false;
  }
}

function getUserId (oauthID) {
  const user = db.get('users')
    .filter({ archived: false, oauthID })
    .value();
  if (user && user.length > 0) return user[0].id;
}

/* ITEMS */
function insertItem (item, watchId) {
  const useLink = item.link !== false;
  const existingItem = useLink ? db.get('items')
    .filter({ link: item.link, watchId })
    .value()
    : db.get('items')
      .filter({ title: item.title, watchId })
      .value();
  if (existingItem.length > 0) {
    return false;
  } else {
    if (typeof (item.price === 'string')) {
      item.price = parseFloat(item.price.replace(',', ''));
    }
    if (isNaN(item.price)) {
      item.price = 0;
    }
    const newItem = {
      userId: item.userId,
      itemType: item.itemType,
      link: item.link,
      title: item.title,
      price: parseInt(item.price, 10),
      info: item.info,
      url: item.url,
      date: item.date,
      watchId: item.watchId,
      creationDate: Date.now(),
      archived: false
    };
    db.defaults({ items: [] })
      .get('items')
      .insert(newItem)
      .write();
    return newItem;
  }
}

function getAllItemsForWatch (watchId) {
  const allItems = db.get('items')
    .filter({ watchId, archived: false })
    .value();
  return allItems;
}
function removeItem (itemId) {
  db.get('items')
    .remove({ id: itemId })
    .write();
}

/* USERS */
function getOrAddUser (profile) {
  const user = db.get('users')
    .filter({ oauthID: profile.id })
    .value();
  debug('USER', user);
  if (user.length > 0) return user[0];
  else {
    const creationDate = Date.now();
    db.defaults({ users: [] })
      .get('users')
      .insert({
        oauthID: profile.id,
        name: profile.displayName,
        creationDate,
        archived: false
      })
      .write();
    const newUser = db.get('users')
      .filter({ oauthID: profile.id, creationDate })
      .value()[0];
    return newUser;
  }
}

function getAllUsers () {
  const allUsers = db.get('users')
    .value();
  return allUsers;
}

/* SUPPORT REQUESTS */
function getAllSupportRequests () {
  const allSupportRequests = db.get('supportRequests')
    .filter({ archived: false })
    .value();
  return allSupportRequests;
}

function insertSupportRequest (supportRequest) {
  const creationDate = Date.now();
  const supportRequestToInsert = {
    url: supportRequest.url,
    supportRequestName: supportRequest.supportRequestName || supportRequest.url,
    userId: supportRequest.userId,
    creationDate,
    archived: false
  };
  db.defaults({ supportRequests: [] })
    .get('supportRequests')
    .insert(supportRequestToInsert)
    .write();
  return db.get('supportRequests')
    .filter({ userId: supportRequestToInsert.userId, creationDate })
    .value()[0];
}

module.exports = {
  getAllStripes,
  insertWatch,
  getAllWatches,
  updateWatch,
  insertItem,
  removeItem,
  insertVerifiedEmail,
  archiveVerifiedEmail,
  getVerifiedEmail,
  verifyEmail,
  getUserId,
  getAllItemsForWatch,
  getOrAddUser,
  getAllUsers,
  getAllSupportRequests,
  insertSupportRequest
};
