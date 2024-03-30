FROM node:18.16-buster-slim as base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /expensee

COPY . .

RUN npm install

EXPOSE 4000

FROM base as prod

WORKDIR /expensee

RUN npm run init

RUN npm run build

CMD npm run prod