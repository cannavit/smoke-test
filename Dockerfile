FROM node:14.9.0-alpine3.10

RUN apk add docker

RUN apk add curl

WORKDIR /var/local

RUN apk update && \
    mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app/

COPY package.json yarn.lock /usr/src/app/

RUN npm install --force

CMD yarn serve