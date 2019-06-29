const chai = require('chai');
const should = chai.should();
require('dotenv').config();

const bodySnatcher = require('../lib/bodySnatcher.js');
const BASE_URL = 'http://localhost:7777';
const TEST_PAGE_1 = 'site-list.html';
const TEST_PAGE_2 = 'site-list-single.html';
const TEST_PAGE_3 = 'site-list-none.html';
const TEST_PAGE_4 = 'site-list-several-js.html';

// sendMail
describe('Getting page body', function() {
  it('should handle multiple JavaScript URLs', function(done) {
    const urls = [`${BASE_URL}/${TEST_PAGE_2}`, `${BASE_URL}/${TEST_PAGE_1}`, `${BASE_URL}/${TEST_PAGE_4}`];
    const options = urls.map((url, i) => ({url, i}));
    bodySnatcher.getPagesJavaScript(options).then(bodies => {
      Number(bodies.length).should.equal(urls.length);
      done();
    }).catch(e => {
      console.error(e);
      (true).should.equal(false);
      done();
    });
  });

  it('should handle multiple non-JavaScript URLs', function(done) {
    const urls = [{url: `${BASE_URL}/${TEST_PAGE_2}`, javascript: false}, {url: `${BASE_URL}/${TEST_PAGE_1}`, javascript: false}];
    bodySnatcher.getPageBodies(urls).then(bodies => {
      Number(bodies.length).should.equal(2);
      done();
    }).catch(e => {
      console.error(e);
      (true).should.equal(false);
      done();
    });
  });

  it('should handle multiple non-JavaScript and JavaScript URLs', function(done) {
    const urls = [{url: `${BASE_URL}/${TEST_PAGE_2}`, javascript: false}, {url: `${BASE_URL}/${TEST_PAGE_1}`, javascript: false}, {url: `${BASE_URL}/${TEST_PAGE_1}`, javascript: true}];
    bodySnatcher.getPageBodies(urls).then(bodies => {
      Number(bodies.length).should.equal(3);
      done();
    }).catch(e => {
      console.error(e);
      (true).should.equal(false);
      done();
    });
  });

  it('should handle single non-JavaScript URL', function(done) {
    bodySnatcher.getPageBody(`${BASE_URL}/${TEST_PAGE_1}`).then(body => {
      (typeof body).should.equal('string');
      done();
    }).catch(e => {
      console.error(e);
      (true).should.equal(false);
      done();
    });
  });
});
