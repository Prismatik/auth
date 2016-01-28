FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get update --fix-missing
RUN apt-get install -y nodejs build-essential git-core python
RUN . /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list

COPY . /opt/auth/

WORKDIR /opt/auth
RUN npm install
RUN ln -s .. node_modules/root

ENTRYPOINT ["node", "/opt/auth/index.js"]
