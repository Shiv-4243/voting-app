FROM node:alpine as builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

FROM node:alpine

WORKDIR /app

COPY --from=builder  /app .

RUN npm install redis

EXPOSE 3000

CMD [ "node", "server.js" ]