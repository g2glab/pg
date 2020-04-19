#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
  const reader = readline.createInterface({input:src});
  reader.on('line', (line) => {
    outputNeo(line);
  });
  reader.on('close', () => {
    // console.error('End!');
  });
} else if (process.stdin.isTTY) {
  commander.help();
} else {
  // outFilePrefix = 'pgfmt';
  const reader = readline.createInterface(process.stdin);
  reader.on('line', (line) => {
    outputNeo(line);
  });
  process.stdin.on('end', () => {
    // console.error('End!');
  });
}

// Functions
function outputNeo(line) {
  if (line.charAt(0) != '#' && line != '') {
    const objectTree = parser.parse(line);
    const nodeProps = Object.keys(objectTree.nodeProperties);
    const edgeProps = Object.keys(objectTree.edgeProperties);
    objectTree.nodes.forEach(n => {
      let line = [];
      line.push(n.id)
      line.push(n.labels)
      nodeProps.forEach(p => {
        if (n.properties[p]) {
          line.push(n.properties[p].join(';'));
        } else {
          line.push('');
        }
      });
      console.log(line.join('\t'));
    });
    objectTree.edges.forEach(e => {
      let line = [];
      line.push(e.from, e.to)
      line.push(e.labels)
      edgeProps.forEach(p => {
        if (e.properties[p]) {
          line.push(e.properties[p].join(';'));
        } else {
          line.push('');
        }
      });
      console.log(line.join('\t'));
    });
  }
}
