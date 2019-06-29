const debug = require('debug')('middleware');

module.exports = function(req, res, next) {
  if (req.user) {
    let userId = req.cookies.id || req.user.id;
    debug(userId);
  } else {
    debug('not logged in');
  }

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.substr(ip.lastIndexOf(':')+1);
  debug(`${req.method} ${req.path} ${ip} ${new Date().toString().substr(0,24)}`);
  next();
};
