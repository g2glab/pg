FROM openjdk:8-jdk

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
 && apt-get install -y nodejs

RUN apt-get update \
 && apt-get install -y \
    unzip \
    vim

RUN cd \
 && echo 'syntax on' > .vimrc

RUN cd /opt \
 && git clone -b v0.3.5 https://github.com/g2gml/pg.git \
 && cd pg \
 && npm install \
 && npm link

WORKDIR /work
