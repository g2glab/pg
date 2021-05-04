FROM alpine:3.13

RUN apk add --no-cache npm

ENV PG_VERSION 0.3.5
RUN cd /opt \
 && wget https://github.com/g2glab/pg/archive/refs/tags/v${PG_VERSION}.zip \
 && unzip v${PG_VERSION}.zip && rm v${PG_VERSION}.zip \
 && cd /opt/pg-${PG_VERSION} \
 && npm install && npm link

WORKDIR /work
