var chai = require('chai');
var should = chai.should();
var readline = require('readline');
require('dotenv').config();

var sendMail = require('../lib/sendMail.js');

const listings = [{
  title: 'Sledgehammer',
  price: 999,
  info: 'Pegs, shocks',
  link: 'http://howtoterminal.com'
}, {
  title: 'Sledgehammer II',
  price: 998,
  info: 'Pegs, shocks, and a Mexican flag behind the seat',
  link: 'http://howtoterminal.com/'
}];

// sendMail
describe('Building subject of email', function() {
  it('should specify if multiple listings are passed in', function(done) {
    let subject = sendMail.buildSubject(listings);
    Number(subject[0]).should.be.at.least(2);
    done();
  });

  it('should specify if one listing is passed in', function(done) {
    let subject = sendMail.buildSubject([listings[0]]);
    Number(subject[0]).should.equal(1);
    done();
  });
});

describe('Building body of email', function() {
  it('should specify if multiple listings are passed in', function(done) {
    let subject = sendMail.buildSubject(listings);
    let body = sendMail.buildBody(listings, subject);
    Number(body[0]).should.be.at.least(2);
    done();
  });

  it('should specify if one listing is passed in', function(done) {
    let subject = sendMail.buildSubject([listings[0]]);
    let body = sendMail.buildBody([listings[0]], subject);
    Number(body[0]).should.equal(1);
    done();
  });
});

const sendTo = process.env.EMAIL_TO;
if (sendTo !== undefined) {
  describe('Sending test SMS', function() {
    it('should be received', function(done) {
      this.timeout(15000);
      sendMail.sendText(listings, sendTo)
      var rl = readline.createInterface(process.stdin, process.stdout),
      prefix = 'You have 15 seconds. Did you receive a text?[y,n] ';
      rl.on('line', function(line) {
        line.trim().should.equal('y');
        done();
      });
      rl.setPrompt(prefix, prefix.length);
      rl.prompt();
    });
  });
}
