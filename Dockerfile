FROM node:8.9




RUN mkdir /usr/src/app
ADD ./ /usr/src/app/

EXPOSE 8888

WORKDIR /usr/src/app

RUN npm install -g npm
RUN chgrp node /usr/local/lib/node_modules
RUN chmod g+rw /usr/local/lib/node_modules
USER node


RUN npm install

CMD (cd /usr/src/app; npm start;)
