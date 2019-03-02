const debug = require('debug')('bodySnatcher');
const puppeteer = require('puppeteer');
const tinyreq = require('tinyreq');

async function puppeteerHelper(page, url, index) {
  return new Promise(async function(resolve, reject) {
    try {
      await page.goto(url, true, {timeout: 60000}); // ignoreHTTPSErrors, timeout
    } catch (e) {
      console.error(e);
      console.error(url, 'FAILED, TRYING AGAIN...');
      try {
        await page.goto(url);
      } catch (e) {
        // TODO: handle better
        resolve({body: 'FAILED', url, index});
      }
    }
    page.evaluate(() => {
      return document.querySelector('body').innerHTML;
    }).then(body => {
      resolve({body, url, index});
    })
    .catch(e => {
      console.warn('PUPPETEER PAGE EVALUATE', e);
      resolve({body: 'FAILED', url, index});
    });
  });
}
function getPagesJavaScript(options) {
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'], executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser'});
    const page = await browser.newPage();
    let objs = [];
    options.reduce(function(p, option, i) { // options.index may not match this loop, see getPageBodies
      return p.then(function(previousObj) {
        if (previousObj) objs.push(previousObj);
        return puppeteerHelper(page, option.url, option.index);
      });
    }, Promise.resolve()).then(async function(previousObj) {
      if (previousObj) objs.push(previousObj);
      await browser.close();
      resolve(objs);
    }).catch(function(err) {
      console.warn(err);
      reject(err);
    });
  });
}
module.exports.getPagesJavaScript = getPagesJavaScript;

function getPage(url, index) {
  return new Promise(function(resolve, reject) {
    tinyreq({
      url,
      headers: {
      }}, (err, body) => {
        if (err) {
          console.warn('TINYREQ', err);
          resolve({ body: 'FAILED', url, index });
        };
        resolve({ body, url, index });
    });
  });
}

module.exports.getPageBodies = function (arr) {
  return new Promise(async function(resolve, reject) {
    let promises = [];
    let jsUrls = [];
    arr.forEach((item, i) => {
      if (item.javascript) jsUrls.push({ url: item.url, index: i });
      else promises.push(getPage(item.url, i));
    });
    const jsArr = await getPagesJavaScript(jsUrls);
    const nonJsArr = await Promise.all(promises);
    const unsortedArr = [...jsArr, ...nonJsArr];
    const sortedArr = unsortedArr.sort(function (a, b) { // sort by original index
      return a.index - b.index;
    });
    resolve(sortedArr);
  });
}
module.exports.getPageBody = function (url, javascript) {
  return new Promise(function(resolve, reject) {
    module.exports.getPageBodies([{url, javascript}]).then(bodies => resolve(bodies[0].body));
  });
}
