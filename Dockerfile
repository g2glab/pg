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
 && git clone -b v0.3.4 https://github.com/g2glab/pg.git \
 && cd pg \
 && npm install \
 && npm link

WORKDIR /work
