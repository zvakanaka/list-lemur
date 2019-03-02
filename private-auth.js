require('dotenv').config();

var port = process.env.PORT || 5000;
var ids = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
};
if (process.env.DOMAIN !== '127.0.0.1' && process.env.DOMAIN !== 'localhost') {
  ids.google.callbackURL = `${process.env.PROTOCOL}://${process.env.DOMAIN}/auth/google/callback`;
} else {
  ids.google.callbackURL = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${port}/auth/google/callback`;
}

module.exports = ids;
