const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const sequential = require('sequential-promise-all');

module.exports = {
  getPagesJavaScript,
  getPageBodies,
  getPageBody
};

async function _puppeteerHelper({page, url, index}) {
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

async function getPagesJavaScript(options) {
  const headless = process.env.FORCE_HEADLESS ? process.env.FORCE_HEADLESS === 'true' : false;
  const launchOptions = {
    headless,
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser'
  };
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  const objs = await sequential(
    _puppeteerHelper,
    [{page, url: options[0].url, index: options[0].index}],
    options.length,
    (argsHandle,
     previousResponse,
     i) => {
       argsHandle[0] = {page, url: options[i].url, index: options[i].index};
     });
  await browser.close();
  return objs;
}

async function getPage(url, index) {
  const options = { headers: {} };
  try {
    const body = await fetch(url, options).then(res => res.text());
    return {body, url, index};
  } catch (err) {
    console.error(err);
    return {body: 'FETCH FAILURE', url, index};
  }
}

async function getPageBodies(arr) {
  let nonJsRequests = [];
  let jsRequests = [];
  arr.forEach((item, i) => {
    if (item.js || item.javascript) jsRequests.push({ url: item.url, index: i });
    else nonJsRequests.push(getPage(item.url, i));
  });
  const nonJsArr = await Promise.all(nonJsRequests);
  const jsArr = jsRequests.length > 0 ? await getPagesJavaScript(jsRequests) : [];
  const unsortedArr = [...jsArr, ...nonJsArr];
  // sort by original index
  const sortedArr = unsortedArr.sort((a, b) => a.index - b.index);
  return sortedArr;
}

async function getPageBody(url, js) {
  const pageBodies = await getPageBodies([{url, js}]);
  return pageBodies[0];
}