Get a text/email when lists on the internet change.

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

## Run it (if not using Docker)
```sh
npm start
```

# Docker
An official Docker image for this project is in the works (works great so far!), but for now you have to build it yourself:

Build:  
`docker build -t [your-docker-hub-username]/list-lemur .`  
Run (note that the `-v` flag to share files is optional and you can share a custom `presetStripes.json` to support more sites than the example):  
`docker run -v $(pwd)/db.json:/home/node/app/db.json --env-file .env --name list-lemur -p 5555:8080 -d [your-docker-hub-username]/list-lemur`  
Start:  
`docker start -a list-lemur`  
Kill:  
`docker kill $(docker ps -lq)`  
Remove:  
`docker container rm $(docker ps -lq)`

[Node images for Docker](https://hub.docker.com/_/node/)