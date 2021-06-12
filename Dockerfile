FROM alpine:3.13

RUN apk add --no-cache git npm

RUN cd /opt \
 && git clone https://github.com/g2glab/pg \
 && cd pg \
 && npm install && npm link

WORKDIR /work
