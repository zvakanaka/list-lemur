function _getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getCode (digits = 6) {
  return `${_getRandomInt(Math.pow(10, digits) - 1)}`.padStart(6, '0');
}

module.exports = getCode;
