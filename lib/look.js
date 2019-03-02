const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const debug = require('debug')('look');
const sendMail = require('./sendMail.js');
const model = require('./db.js');

function look(options, bodyString) {
  if (!options || !bodyString) throw new Error('Missing parameter in look function');
  const promise = new Promise(async function(resolve, reject) {
    const insert = options.insert || true;
    debug('insert =', insert);
    const sendMessage = !options.firstLook;
    const hostname = (new URL(options.url)).hostname;
    const bodyClean = bodyString
      .replace(/<script/g, '<scmipt')
      .replace(/<img /g, '<smimg ')
      .replace(/<iframe/g, '<smiframe')
      .replace(/<style/g, '<smyle')
      .replace(/ href="\//g, ` href="http${options.url.startsWith('https') ? 's' : ''}://${hostname}/`);

    const { document } = (new JSDOM(bodyClean)).window;
    let listings = [];
    const quals = options.selectors;
    const listingEls = document.querySelectorAll(quals.listing);
    let listingLength = listingEls.length; // to know when to resolve
    console.log(`${listingLength} items found on ${hostname} with ${quals.listing} (${options.watchName}) at:`);
    if (listingLength !== 0) {
      // set all previous to deleted and reset to true if we find same again
      listingEls.forEach(function(listing, index) {
        let title = '';
        if (quals.title) {
          title = listing.querySelector(quals.title).textContent.trim();
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

        const unwanted = (typeof options.unwantedWords === 'undefined' || options.unwantedWords === '') ? false : options.unwantedWords.split(',').some(unwantedWord => {
          return title.toLowerCase().indexOf(unwantedWord.toLowerCase()) > -1;
        });
        const wanted = (typeof options.requiredWords === 'undefined' || options.requiredWords === '') ? true : options.unwantedWords.split(',').some(requiredWord => {
          return title.toLowerCase().indexOf(requiredWord.toLowerCase()) > -1;
        });
        if (insert === true && !unwanted && wanted) {
          const result = model.insertItem(item);
          if (result === false) {
            // item exists 🚳
          } else {
            let didSendMail = false;
            if (sendMessage === true && !process.env.NO_SEND_MAIL) {
              try {
                options.sendTo.split(',').forEach(emailAddress => {
                  sendMail.sendText([item], emailAddress)
                    .then(message => {
                      // sent message
                    })
                    .catch(e => {
                      console.error('sendMail:', e);
                    });
                });
              } catch (e) {
                console.error('Mail Error', e);
              }
              didSendMail = true;
            } else {
              if (process.env.NO_SEND_MAIL) console.log('MAIL IS OFF: re-enable by removing config var \'NO_SEND_MAIL\'');
            }
            console.log(`🚲 ${item.title}, ${didSendMail ? '📨' : '✉'}`);
          }
        }
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

function noUndef(str) {
  if (typeof str === 'undefined') return '';
  return str;
}

module.exports = look;
