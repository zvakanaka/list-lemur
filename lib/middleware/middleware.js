module.exports = function(req, res, next) {
  if (req.user) {
    let userId = req.cookies.id || req.user.id;
    console.log(userId);
  } else {
    console.log('not logged in');
  }

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.substr(ip.lastIndexOf(':')+1);
  console.log(`${req.method} ${req.path} ${ip} ${new Date().toString().substr(0,24)}`);
  next();
};
