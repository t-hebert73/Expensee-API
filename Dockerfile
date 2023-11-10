FROM node:18.16-buster-slim as base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install 
RUN npx prisma generate

COPY . .

EXPOSE 4000

FROM base as prod

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules

RUN npm install
RUN npm run prisma-build

RUN npm run build

CMD npm run prod