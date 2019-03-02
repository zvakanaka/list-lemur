var chai = require('chai');
var isAdmin = require('../lib/isAdmin.js');

var should = chai.should();

describe('Check if ip from localhost is admin ', function() {
  it('should return affirmative', function() {
    let ip = 'localhost';
    let isAnAdmin = isAdmin.check(ip);
    isAnAdmin.should.equal(true);

    ip = '127.0.0.1';
    isAnAdmin = isAdmin.check(ip);
    isAnAdmin.should.equal(true);

    // // http://stackoverflow.com/a/9542157/4151489
    // require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    //   ip = add;
    //   isAnAdmin = isAdmin.check(ip);
    //   console.log(ip);
    //   isAnAdmin.should.equal(true);
    // });
  });
});

describe('Check if ip from external host is admin ', function() {
  it('should return negatory', function() {
    let ip = '111.11.1.11';
    let isAnAdmin = isAdmin.check(ip);
    isAnAdmin.should.equal(false);
  });
});
