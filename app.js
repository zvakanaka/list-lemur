// TODO: move routes
require('dotenv').config();
const express = require('express');
const debug = require('debug')('http');
const path = require('path');
const middleware = require('./lib/middleware/middleware.js');
const isAdmin = require('./lib/isAdmin.js');
const passport = require('passport');
const config = require('./lib/privateAuth.js');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const cookieParser = require('cookie-parser');
const fs = require('fs');
const model = require('./lib/db.js');
const modelHelpers = require('./lib/modelHelpers.js');
const timeout = (ms) => new Promise((r) => setTimeout(r, ms));
const redirectRoot = process.env.GOOGLE_AUTH_CALLBACK_ROOT ? process.env.GOOGLE_AUTH_CALLBACK_ROOT : '';
const UTC_OFFSET = process.env.hasOwnProperty('UTC_OFFSET') ? parseInt(process.env.UTC_OFFSET, 10) : -7;
const WATCH_START_HOUR = process.env.hasOwnProperty('WATCH_START_HOUR') ? parseInt(process.env.WATCH_START_HOUR, 10) : 7;
const WATCH_UNTIL_HOUR = process.env.hasOwnProperty('WATCH_UNTIL_HOUR') ? parseInt(process.env.WATCH_UNTIL_HOUR, 10) : 20;
const WATCH_EXCLUDE_DAYS = process.env.hasOwnProperty('WATCH_EXCLUDE_DAYS') ? process.env.WATCH_EXCLUDE_DAYS.split(',').map(dayStr => dayStr.toLowerCase()) : [];

/**
 * passport
 */
// serialize and deserialize
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL
},
  function (request, accessToken, refreshToken, profile, done) {
    model.getOrAddUser(profile);
    done(null, profile);
  }
));

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(cookieParser());

app.set('json spaces', 2);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'assets')));
// app.use('/components', express.static(__dirname + '/components'));

app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var PORTNO = process.env.PORT || 5000;

if (process.env.PROTOCOL === 'https') {
  var https = require('https');
  var expressHttpsOptions = {
    ca: [fs.readFileSync(process.env.PATH_TO_BUNDLE_CERT)],
    cert: fs.readFileSync(process.env.PATH_TO_CERT),
    key: fs.readFileSync(process.env.PATH_TO_KEY)
  };
  var server = https.createServer(expressHttpsOptions, app);
  server.listen(PORTNO, function () {
    if (process.env.DOMAIN !== '127.0.0.1' && process.env.DOMAIN !== 'localhost') {
      console.log(`server running at ${process.env.PROTOCOL}://${process.env.DOMAIN}`);
    } else {
      console.log(`server running at ${process.env.PROTOCOL}://${process.env.DOMAIN}:${PORTNO}`);
    }
  });
} else {
  app.listen(PORTNO);
  if (process.env.DOMAIN !== '127.0.0.1' && process.env.DOMAIN !== 'localhost') {
    console.log(`server running at ${process.env.PROTOCOL}://${process.env.DOMAIN}`);
  } else {
    console.log(`server running at ${process.env.PROTOCOL}://${process.env.DOMAIN}:${PORTNO}`);
  }
}

app.use(middleware);

app.get('/watching', whoIsThere, async function (req, res) {
  const userId = model.getUserId(req.user.id);
  const userWatches = modelHelpers.getAllWatchesForUser(userId);
  // modelHelpers.popItems(userId);

  // put archived watches last
  userWatches.sort((a, b) => {
    const aSortKey = a.archived ? 1 : 0
    const bSortKey = b.archived ? 1 : 0
    return aSortKey - bSortKey
  })
  res.render('watching', {
    page: req.url, // url
    user: req.user,
    userWatches
  });
});

app.post('/update-watch', whoIsThere, async function (req, res) {
  debug('POST /update-watch');
  const userId = model.getUserId(req.user.id);
  const watch = { ...req.body, userId };
  try {
    model.updateWatch(watch);
    res.json({ success: 'Watch updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update watch' });
  }
});

app.get('/watch', requireAdmin, async function (req, res) {
  debug('GET /watch');
  res.type('json');
  const watches = modelHelpers.getAllActiveWatches();
  if (typeof watches === 'undefined' || watches.length === 0) {
    res.json([]);
    return;
  }
  res.json(watches);
  modelHelpers.watch(watches);
});

app.get('/', function (req, res) {
  debug('GET /');
  if (req.user) res.redirect(`${redirectRoot}/paste-link`);
  else {
    res.render('login', {
      page: req.url, // url
      user: { displayName: null }
    });
  }
});

app.get('/account', whoIsThere, function (req, res) {
  res.render('account', {
    page: req.url, // url
    user: req.user
  });
});

app.get('/paste-link', whoIsThere, async function (req, res) {
  const email = model.getVerifiedEmail(model.getUserId(req.user.id));
  if (!email) res.redirect(`${redirectRoot}/settings`);
  else {
    res.render('paste-link', {
      page: req.url, // url
      user: req.user
    });
  }
});

app.get('/settings', whoIsThere, async function (req, res) {
  const email = model.getVerifiedEmail(model.getUserId(req.user.id));
  res.render('settings', {
    page: req.url, // url
    user: req.user,
    email
  });
});

app.post('/add-link', whoIsThere, async function (req, res) {
  debug('POST /add-link');
  const userId = model.getUserId(req.user.id);
  const link = req.body.link;
  if (!modelHelpers.isValidLink(link)) {
    res.status(400).json({ error: 'Invalid link' });
    return;
  }
  const stripe = modelHelpers.getStripe(link);
  if (!stripe) {
    model.insertSupportRequest({
      url: link,
      userId
    });
    res.status(409).json({ error: 'Site not yet supported' });
    return;
  }
  const existingWatchesForUser = modelHelpers.getAllWatchesForUser(userId)
  if (existingWatchesForUser.find(watch => watch.url === link)) {
    res.status(409).json({ error: 'You are already watching this link' });
    return;
  }
  const watchToInsert = {
    url: link,
    stripeId: stripe.id,
    userId
  };
  // look for only this watch (without sending messages)
  const watch = model.insertWatch(watchToInsert);
  const watches = modelHelpers.getAllActiveWatches().filter(w => w.creationDate === watch.creationDate);
  if (typeof watches === 'undefined' || watches.length === 0) {
    res.json([]);
    return;
  }
  const insertedWatch = Object.assign({}, { firstLook: true }, watches[0]);
  modelHelpers.watch([insertedWatch]);
  const search = { link };
  res.json(search);
});

app.post('/verify-code', whoIsThere, async function (req, res) {
  debug('POST /verify-code');
  const userId = model.getUserId(req.user.id);
  const code = req.body.code;
  if (!modelHelpers.isValidCode(userId, code)) {
    res.status(409).json({ error: 'Invalid code' });
    return;
  }
  res.json({ success: 'Email validated' });
});

app.post('/send-code', whoIsThere, async function (req, res) {
  debug('POST /send-code');
  const userId = model.getUserId(req.user.id);
  const email = req.body.email;
  if (!modelHelpers.isValidEmail(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }
  const codeSent = modelHelpers.sendCode(email, userId);
  if (!codeSent) {
    res.status(409).json({ error: 'User account error' });
    return;
  }
  res.json({ success: true });
});

app.get('/reset-email', whoIsThere, async function (req, res) {
  debug('GET /reset-email');
  const userId = model.getUserId(req.user.id);
  model.archiveVerifiedEmail(userId);
  res.json({ success: true });
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login'
    ]
  }
  ));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    res.cookie('id', req.user.id, { maxAge: 900000, httpOnly: true });
    res.redirect(`${redirectRoot}/`);
  });

app.get('/logout', function (req, res) {
  res.clearCookie('id');
  req.logout();
  res.redirect(`${redirectRoot}/`);
});

// authentication
function whoIsThere(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  debug('Not authenticated - redirecting');
  res.redirect(`${redirectRoot}/auth/google`);
}

function requireAdmin(req, res, next) {
  if (isAdmin.check(req.ip)) {
    return next();
  }
  debug(req.ip + 'is not admin - redirecting');
  res.status(403).send('Must be admin');
}

function watch() {
  const watches = modelHelpers.getAllActiveWatches();
  if (typeof watches === 'undefined' || watches.length === 0) {
    return;
  }
  modelHelpers.watch(watches);
}

const halfHourInMs = 30 * 60 * 1000;
setInterval(async () => {
  const randomWaitTime = Math.floor(Math.random() * 60 + 1);
  await timeout(randomWaitTime * 1000);

  const date = new Date();

  const dateTime = {
    date: {
      month: () => date.getUTCMonth() + 1,
      day: () => date.getUTCDate()
    },
    time: {
      hour: () => date.getUTCHours(),
      minute: () => date.getUTCMinutes(),
      second: () => date.getUTCSeconds(),
    }
  }
  const month = dateTime.date.month();
  const day = dateTime.date.day();
  // time of year when clocks go forward
  const isDaylightSavings = month >= 3 && month <= 11 &&
    (month != 3 || day >= 13) &&
    (month != 11 || day < 6);

  const hourOffset = UTC_OFFSET + (isDaylightSavings ? 1 : 0);
  const hour = dateTime.time.hour();
  const hereHour = hour < Math.abs(hourOffset) ? hour + 24 + hourOffset : hour + hourOffset;
  const dayStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
  if (hereHour >= WATCH_START_HOUR && hereHour < WATCH_UNTIL_HOUR && !WATCH_EXCLUDE_DAYS.includes(dayStr.toLocaleLowerCase())) {
    watch();
  }
}, process.env.WATCH_INTERVAL ? Number(process.env.WATCH_INTERVAL) * 60 * 1000 : halfHourInMs);
watch();
