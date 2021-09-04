Get a text/email when lists on the internet change.
## Setup
```sh
npm install
```

### Default 'Stripes' (`presetStripes.json`)
*a stripe is a pattern that describes how to recognize parts of a list on a website*
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
  },
  {
    "prefix": "https://www.debian.org/security/dsa",
    "rss": true
  }
]
```

### Environment Variables (`.env`)
*Set up the following to have what you need to make a `.env` file:*
1. [Google OAuth](https://console.developers.google.com/apis/credentials/oauthclient) (Callback URL of http://127.0.0.1:1234/auth/google/callback will work for localhost)
2. A Gmail that is [allowed to send mail from less secure apps](https://support.google.com/accounts/answer/6010255?hl=en)

See [.env.example](./.env.example) for example environment variables.

## Run it
```sh
npm start
```

## Use a Cron Job to Periodically Watch Sites
```sh
HOME=/home/pi

NPM_PATH=/home/pi/.nvm/versions/node/v12.18.0/bin/npm
@reboot cd $HOME/list-lemur; $NPM_PATH start >> npm-debug.log
# See crontab.guru for help, the sleep adds some randomness
*/30 7-19 * * 1-6 sleep $(( 1$(date +\%N) \% 60 )) && curl -s http://localhost:5555/watch > /dev/null
```
