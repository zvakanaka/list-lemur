require('dotenv').config();

var port = process.env.PORT || 5000;
var ids = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
};
if (process.env.DOMAIN !== '127.0.0.1' && process.env.DOMAIN !== 'localhost') {
  const callbackRoot = process.env.GOOGLE_AUTH_CALLBACK_ROOT ? process.env.GOOGLE_AUTH_CALLBACK_ROOT : `${process.env.PROTOCOL}://${process.env.DOMAIN}`;
  ids.google.callbackURL = `${callbackRoot}/auth/google/callback`;
} else {
  const callbackRoot = process.env.GOOGLE_AUTH_CALLBACK_ROOT ? process.env.GOOGLE_AUTH_CALLBACK_ROOT : `${process.env.PROTOCOL}://${process.env.DOMAIN}:${port}`;
  ids.google.callbackURL = `${callbackRoot}/auth/google/callback`;
}

module.exports = ids;
