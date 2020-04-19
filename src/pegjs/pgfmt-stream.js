#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('./pg_parser.js');

const commander = require('commander')
      .option('-f, --format <FORMAT>', 'json, neo')
      .option('-o, --outdir <DIR>', 'output directory', './')
      .option('-c, --check', 'check for missing/orphan nodes')
      .option('-d, --debug', 'output parsed synatax tree')
      .option('-s, --stats', 'output stats for nodes and labels')
      .arguments('<PG_FILE>')
      .version(require("../../package.json").version)
      .parse(process.argv);

// Get input and output file names
if(commander.args[0]) {
  const inputFile = commander.args[0];
  const src = fs.createReadStream(inputFile, 'utf8');
  src.pipe(process.stdout);
} else if (process.stdin.isTTY) {
  commander.help();
} else {
  // inputText = fs.readFileSync(process.stdin.fd).toString();
  // outFilePrefix = 'pgfmt';
}
