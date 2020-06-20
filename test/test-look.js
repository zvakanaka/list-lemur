const chai = require('chai');
const should = chai.should();
const look = require('../lib/look.js');
require('dotenv').config();
const fs = require('fs');

function readFile (filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return data.toString();
  } catch (e) {
    console.error('Error:', e.stack);
  }
}

describe('Looking at a page', function () {
  it('should get all of the listings', function (done) {
    const bodyString = readFile('./test/pages/site-list.html');
    const options = {
      selectors: {
        listing: 'li',
        title: 'a',
        link: 'a',
        description: false,
        price: false
      },
      url: 'https://localhost:7777/site-list.html',
      watchName: 'GitHub IO Pages'
    };
    look(options, bodyString).then(results => {
      Number(results.listings.length).should.equal(3);
      done();
    }).catch(e => {
      console.error(e);
      (true).should.equal(false);
      done();
    });
  });
});
