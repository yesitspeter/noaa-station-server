FROM node:7.10

RUN mkdir /usr/src/app

EXPOSE 8888

WORKDIR /usr/src/app
RUN npm install
RUN npm install -g foreverjs

CMD forever -c "npm start" /usr/src/app
