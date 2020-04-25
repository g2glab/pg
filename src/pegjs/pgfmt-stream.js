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
const sep = '\t';
let inputFile;
let outFilePrefix;
let nodesFile;
let edgesFile;
let nodesOutStream;
let edgesOutStream;
let nodeProps = {};
let edgeProps = {};
if(commander.args[0]) {
  inputFile = commander.args[0];
  const basename = path.basename(inputFile, '.pg');
  if (!fs.existsSync(commander.outdir)) {
    fs.mkdirSync(commander.outdir, {recursive: true});
  }
  outFilePrefix = path.join(commander.outdir, basename);
  nodesFile = outFilePrefix + '.neo.nodes';
  edgesFile = outFilePrefix + '.neo.edges';
  nodesOutStream = fs.createWriteStream(nodesFile);
  edgesOutStream = fs.createWriteStream(edgesFile);
  listProps(() => {
    writeHeaderNodes(() => {
      writeHeaderEdges(() => {
        writeNodesAndEdges(() => {
          console.log('"' + nodesFile + '" has been created.');
          console.log('"' + edgesFile + '" has been created.');
        });
      });
    });
  });
} else if (process.stdin.isTTY) {
  commander.help();
} else {
  const reader = readline.createInterface(process.stdin);
  reader.on('line', (line) => {
    outputNeoStdout(line);
  });
  // reader.on('close', () => {
  process.stdin.on('end', () => {
  });
}

// Functions
function listProps(callback) {
  let rs = fs.createReadStream(inputFile, 'utf8');
  let rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#' && line != '') {
      const objectTree = parser.parse(line);
      Object.keys(objectTree.nodeProperties).forEach(p => {
        nodeProps[p] = true;
      });
      Object.keys(objectTree.edgeProperties).forEach(p => {
        edgeProps[p] = true;
      });
    }
  });
  rl.on('close', () => {
    callback();
  });
}

function addProps(allProps, props) {
  for (let [key, values] of props) {
    if (values.size === 1) {
      for (let value of values) {
        if (! allProps.has(key)) {
          allProps.set(key, value.type());
        }
      }
    } else {
      let type = null;
      for (let value of values) {
        if ((type === null) || (type === value.type())) {
          type = value.type();
        } else {
          console.log('WARNING: Neo4j only allows homogeneous lists of datatypes (', type, ' and ', value.type());
        }
      }
      if ((! allProps.has(key)) || (allProps.get(key) === type)) {
        allProps.set(key, type + '[]');
      }
    }
  }
}

function writeHeaderNodes(callback) {
  let output = ['id:ID', ':LABEL'];
  nodesOutStream.write(output.concat(Object.keys(nodeProps)).join(sep) + '\n', (err) => {});
  callback();
}

function writeHeaderEdges(callback) {
  let output = [':START_ID', ':END_ID', ':TYPE'];
  edgesOutStream.write(output.concat(Object.keys(edgeProps)).join(sep) + '\n', (err) => {});
  callback();
}

function writeNodesAndEdges(callback) {
  let rs = fs.createReadStream(inputFile, 'utf8');
  let rl = readline.createInterface(rs, {});
  rl.on('line', (line) => {
    if (line.charAt(0) != '#' && line != '') {
      const objectTree = parser.parse(line);
      objectTree.nodes.forEach(n => {
        let line = [];
        line.push(n.id)
        line.push(n.labels)
        Object.keys(nodeProps).forEach(p => {
          if (n.properties[p]) {
            line.push(n.properties[p].join(';'));
          } else {
            line.push('');
          }
        });
        nodesOutStream.write(line.join(sep) + '\n');
      });
      objectTree.edges.forEach(e => {
        let line = [];
        line.push(e.from, e.to)
        line.push(e.labels)
        Object.keys(edgeProps).forEach(p => {
          if (e.properties[p]) {
            line.push(e.properties[p].join(';'));
          } else {
            line.push('');
          }
        });
        edgesOutStream.write(line.join(sep) + '\n');
      });
    }
  });
  rl.on('close', () => {
    nodesOutStream.end();
    edgesOutStream.end();
    callback();
  });
}

function outputNeoStdout(line) {
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
