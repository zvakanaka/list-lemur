require('dotenv').config();
const debug = require('debug')('isAdmin');

// admin
function isAdmin(ip) {
  debug('ip:', ip);
  if (ip.includes('127.0.0.1') ||
      ip.includes('localhost') ||
      ip.includes('::1') ||
      ip.includes(process.env.SERVER_IP) ||
      process.env.ADMIN_IPS && process.env.ADMIN_IPS.split(',').some(adminIp => adminIp === ip)) {
    return true;
  }
  return false;
}

module.exports = {check: isAdmin};
