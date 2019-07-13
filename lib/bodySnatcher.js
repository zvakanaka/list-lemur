const debug = require('debug')('bodySnatcher');
const puppeteer = require('puppeteer');
const Zombie = require('zombie');
const tinyreq = require('tinyreq');
const sequentialPromiseAll = require('sequential-promise-all');

async function _puppeteerHelper(page, url, index) {
  return new Promise(async function(resolve, reject) {
    try {
      await page.goto(url, true, {timeout: 60000}); // ignoreHTTPSErrors, timeout
    } catch (e) {
      console.error(e);
      console.error(url, 'FAILED, TRYING AGAIN...');
      try {
        await page.goto(url, true, {timeout: 60000});
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

async function getPageArmArch(options) {
  const browser = new Zombie();
  const page = await browser.visit(options.url);
  const body = browser.document.documentElement.innerHTML;
  browser.tabs.closeAll();
  return {body: Buffer.from(body, 'utf8').toString(), url: options.url, index: options.index};
}

async function getPagesJavaScript(options) {
  if (process.arch !== 'arm' && !process.env.FORCE_ARCH_ARM) {
    return getPagesJavaScriptNonArmArch(options);
  } else {
    const responses = await sequentialPromiseAll(
      getPageArmArch,
      [options[0]],
      options.length,
      (argsHandle, _previousResponse, i) => {
        argsHandle[0] = options[i];
      }
    );
    return responses;
  }
}

function getPagesJavaScriptNonArmArch(options) {
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'], executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser'});
    const page = await browser.newPage();
    let objs = [];
    options.reduce(function(p, option, i) { // options.index may not match this loop, see getPageBodies
      return p.then(function(previousObj) {
        if (previousObj) objs.push(previousObj);
        return _puppeteerHelper(page, option.url, option.index);
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

function getPageBodies(arr) {
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

function getPageBody(url, javascript) {
  return new Promise(function(resolve, reject) {
    module.exports.getPageBodies([{url, javascript}]).then(bodies => resolve(bodies[0].body));
  });
}

module.exports = {
  getPagesJavaScript,
  getPageBodies,
  getPageBody
};
