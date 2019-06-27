Get a text/email when lists on the internet change.
## Setup
```sh
npm install
```

### Default 'Stripes' (`presetStripes.json`)
*a stripe is a pattern that describes a list on a website*
```js
[
  {
    "prefix": "https://news.ycombinator.com/",
    "selectors": {
      "listing": ".athing",
      "title": ".storylink",
      "link": ".storylink",
      "description": false,
      "price": false
    },
    "javascript": false
  }
]
```

### Environment Variables (`.env`)
*Set up the following to have what you need to make a `.env` file:*
1. [Google OAuth](https://console.developers.google.com/apis/credentials/oauthclient) (Callback URL of http://127.0.0.1:1234/auth/google/callback will work for localhost)
2. An email that is [allowed to send mail from less secure apps](https://support.google.com/accounts/answer/6010255?hl=en)

```sh
PORT=1234
DEBUG=isAdmin
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''
EMAIL_FROM=''
EMAIL_PASSWORD=''
PROTOCOL='http'
DOMAIN='yourdomain.com'
```

## Run it
```sh
npm start
```
