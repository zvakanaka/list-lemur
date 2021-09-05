Get a text/email when lists on the internet change.

## Docker
`docker pull zvakanaka/list-lemur`  

`docker run -v /path/to/presetStripes.json:/home/node/app/presetStripes.json --env-file /path/to/.env --name list-lemur -p 80:8080 -d zvakanaka/list-lemur`

`docker start -a list-lemur`  

https://user-images.githubusercontent.com/8365885/132111736-3ba6a2c5-fe55-4d71-abfc-0a3c4d6f2da1.mp4

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
`presetStripes.json` is pulled in only if `db.json` does not exist (e.g. at first boot or if you delete `db.json`). If you want to add stripes without getting rid of `db.json`, you can add them to `db.json` (after killing the node app) under the `stripes` array. If you want your users/data to persist, it's recommended to start the app with the `db.json` file shared through the Docker `-v` flag (just like `presetStripes.json` is in the Docker instructions above).  

Stripes behave like a whitelist - the only URLs that can be watched must start with a `prefix` in a stripe.  

Selectors use [CSS query selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) to identify items on a page (not needed for RSS). See [this selector playground](https://www.w3schools.com/cssref/trysel.asp) for practice.

The `javascript` flag determines whether to use Puppeteer or a simple network request to fetch a page.  

The `rss` flag is used for RSS feeds.  

### Environment Variables (`.env`)
*Set up the following to have what you need to make a `.env` file:*
1. [Google OAuth](https://console.developers.google.com/apis/credentials/oauthclient) (Callback URL of http://127.0.0.1:1234/auth/google/callback will work for localhost)
2. A Gmail that is [allowed to send mail from less secure apps](https://support.google.com/accounts/answer/6010255?hl=en)

See [.env.example](./.env.example) for example environment variables.

The Docker `--env-file` (seen in the Docker instructions above) can be used to load your env file into the Docker image. Keep this file safe as it is where your credentials for the email-sending account and Google auth are stored.

# Docker Development
There is an official Docker image for this project (see above), but here are instructions if you'd like to build it yourself:

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
