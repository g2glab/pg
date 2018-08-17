FROM node:8.11.4

RUN git clone -b v0.1.0 https://github.com/g2gml/pg.git
RUN cd pg && npm install && npm link
