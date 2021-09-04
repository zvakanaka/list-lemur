FROM node:14-alpine3.14

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN apk add --update --no-cache firefox-esr

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080


CMD [ "node", "app.js" ]