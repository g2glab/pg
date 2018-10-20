#!/bin/bash

mkdir -p output

./node_modules/mocha/bin/mocha --timeout=5000
if [ $? != 0 ]; then
  exit
fi
