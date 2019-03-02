// Send new item reports through email
const env = require('dotenv');
const email = require('emailjs');
//Put the following in .env:
//EMAIL_FROM='example@gmail.com'
//EMAIL_PASSWORD='pass'
//EMAIL_TO='Jon 5555555555@text.republicwireless.com'

const mailServer = email.server.connect({
    user:     process.env.EMAIL_FROM || '',
    password: process.env.EMAIL_PASSWORD || '',
    host:     "smtp.gmail.com",
    ssl:      true,
    port:     465
});

function buildSubject(listings) {
  let subject = listings.length;
  if (listings.length === 1) subject += ' new item\n';
  else subject += ' new items\n';
  return subject;
}

function buildBody(listings, subject) {
  let body = subject;// begin with subject
  listings.forEach(function(item, index) {
    const price = item.price ? ' $'+item.price : '';
    body += item.title + price + ' ' + (item.link || item.url) + ' '
         + item.info;
    if (index === listings.length-1) body += '\n\n';//last line
    else body += '\n';
  });
  return body;
}

/*******
 @param listings
 array of results to send
 ********/
function sendText(listings, sendTo) {
  return new Promise(function(resolve, reject) {
    let subject = '';//buildSubject(listings);
    let text = buildBody(listings, subject);

    mailServer.send({
       text:    text,
       from:    process.env.EMAIL_FROM || '',
       to: sendTo || process.env.EMAIL_TO,
       subject: subject
    }, function(err, message) {
      if (err) {
        console.warn('SENDMAIL', err);
        reject(err);
      }
      else resolve(message);
    });
  });
}

function sendVerificationEmail(code, sendTo) {
  return new Promise(function(resolve, reject) {
    let subject = 'Verify your List Lemur Account';
    let text = `Your verification code is: ${code}`;

    mailServer.send({
       text:    text,
       from:    process.env.EMAIL_FROM || '',
       to: sendTo || process.env.EMAIL_TO,
       subject: subject
    }, function(err, message) {
      if (err) {
        console.warn('SENDMAIL', err);
        reject(err);
      }
      else resolve(message);
    });
  });
}

module.exports = {
  buildSubject,
  buildBody,
  sendText,
  sendVerificationEmail
};
