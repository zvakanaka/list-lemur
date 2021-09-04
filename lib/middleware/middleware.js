const debug = require('debug')('middleware');

module.exports = function (req, res, next) {
  const loggedIn = req.user;
  if (loggedIn) {
    const userId = req.cookies.id || req.user.id;
    debug(userId);
  }

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip ? ip.substr(ip.lastIndexOf(':') + 1) : '<unkown_ip>';
  console.log(`${req.method.padEnd(4, ' ')} ${req.path.padEnd(32, ' ')} ${`[${loggedIn ? 'L' : 'Not l'}ogged In]`.padEnd(15)} ${ip} ${new Date().toString().substr(0, 24)}`);
  next();
};
