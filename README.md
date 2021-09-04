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

# Docker
https://hub.docker.com/_/node/
`docker build -t zvakanaka/nodejs-list-lemur .`  
`docker run -v $(pwd)/db.json:/home/node/app/db.json --env-file .env --name nodejs-list-lemur -p 5555:8080 -d zvakanaka/nodejs-list-lemur`  
`docker start -a nodejs-list-lemur`  
`docker kill $(docker ps -lq)`  
`docker container rm $(docker ps -lq)`
