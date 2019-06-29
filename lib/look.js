const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const debug = require('debug')('look');

function cleanBody(bodyString, options, hostname) {
  const bodyClean = bodyString
    .replace(/<script/g, '<scmipt')
    .replace(/<img /g, '<smimg ')
    .replace(/<iframe/g, '<smiframe')
    .replace(/<style/g, '<smyle')
    .replace(/ href="\//g, ` href="http${options.url.startsWith('https') ? 's' : ''}://${hostname}/`);
  return bodyClean;
}

function look(options, bodyString) {
  if (!options || !bodyString) throw new Error('Missing parameter in look function');

  const promise = new Promise(async function(resolve, reject) {
    const hostname = (new URL(options.url)).hostname;
    const bodyClean = cleanBody(bodyString, options, hostname);
    const { document } = (new JSDOM(bodyClean)).window;
    const listings = [];
    const quals = options.selectors;
    const listingEls = document.querySelectorAll(quals.listing);
    let listingLength = listingEls.length; // to know when to resolve
    console.log(`${listingLength} items found on ${hostname} with ${quals.listing} (${options.watchName}) at:`);
    if (listingLength !== 0) {
      // set all previous to deleted and reset to true if we find same again
      listingEls.forEach(function(listing, index) {
        let title = '';
        if (quals.title) {
          const titleEl = listing.querySelector(quals.title);
          title = titleEl ? titleEl.textContent.trim() : '';
        }
        let link = '';
        if (listing.querySelector(quals.link)) link = listing.querySelector(quals.link).getAttribute('href');
        if (link === '') link = false;
        let price = '0';
        if (quals.price) {
          price = listing.querySelector(quals.price).textContent.trim().split('/')[0];
          if (price === '') {
            price = '0';
          }
        }
        if (price[0] === '$') {
          price = price.substring(1, price.length);
        }

        //description
        let description = '';
        if (quals.description) {
          description = listing.querySelector(quals.description).textContent.trim();
        }
        if (description.length > 256) { // add ellipses if long
          description = `${description.substring(0, 256)}...`;
        }

        const item = {
            itemType: options.watchName,
            userId: options.userId,
            watchId: options.id,
            stripeId: options.stripeId,
            title,
            link,
            price,
            info: description,
            url: options.url,
            date: new Date()
          };

        if (index === listingLength - 1) {
          resolve({url: options.url, listings});//done checking duplicates in $list
        }
        listings.push(item);
      });

    } else {
      resolve({url: options.url, listings: []});
    }
  });
  return promise;
}

module.exports = look;
