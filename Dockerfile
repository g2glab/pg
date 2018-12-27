FROM node:8.11.4

RUN apt-get update && apt-get install -y \
    unzip \
    vim

RUN git clone -b v0.2.1 https://github.com/g2gml/pg.git
 && cd pg && npm install && npm link

RUN cd && echo 'syntax on' > .vimrc

RUN mkdir /shared
WORKDIR /shared
