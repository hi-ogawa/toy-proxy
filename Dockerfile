### development
FROM node:10.16.3-jessie as dev

### production
FROM node:10.16.3-alpine as prod

ENV NODE_ENV=production
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY src ./src

CMD ["node", "./src/proxy.js"]
