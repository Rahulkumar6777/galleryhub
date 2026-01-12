FROM node:20.19.5

WORKDIR ./app

COPY package*.json .

RUN npm ci

COPY . .

CMD [ "node" , "server.js" ]