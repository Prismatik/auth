FROM node:6
MAINTAINER Prismatik Pty. Ltd. <david@prismatik.com.au>

COPY ./package.json /opt/app/

WORKDIR /opt/app

RUN NODE_ENV=null npm install
RUN ln -s .. node_modules/root

ADD . /opt/app/

EXPOSE 3000

CMD npm start
