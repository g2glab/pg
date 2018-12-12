# USAGE
# docker run -v $PWD:/shared g2gml/pg:0.1.0 pg2xxx <in_pg_file> <out_prefix>

FROM node:8.11.4

RUN apt-get update && apt-get install -y \
    unzip \
    vim

RUN git clone -b v0.1.0 https://github.com/g2gml/pg.git
 && cd pg && npm install && npm link

RUN mkdir /shared
WORKDIR /shared
