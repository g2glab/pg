#!/usr/bin/env node

let fs = require('fs');
let readline = require('readline');
let pg = require('./pg2.js');

pg.commander.parse(process.argv);
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

let nodeProps = new Map();
let edgeProps = new Map();

const pathNodes = prefix + '.aws.nodes';
const pathEdges = prefix + '.aws.edges';
const streamNodes = fs.createWriteStream(pathNodes);
const streamEdges = fs.createWriteStream(pathEdges);
const sep = ',';
const typeMap = {
  string: 'String',
  double: 'Double',
  int: 'Int'
};


listProps(function() {
  writeHeaderNodes(function() {
    writeHeaderEdges(function() {
      writeNodesAndEdges(function() {
        console.log('"' + pathNodes + '" has been created.');
        console.log('"' + pathEdges + '" has been created.');
      });
    });
  });
});

function listProps(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      let [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 === null) { // Node
        for (let [key, values] of props) {
          for (let value of values) {
            if (! nodeProps.has(key)) {
              nodeProps.set(key, typeMap[value.type()]);
            }
          }
        }
      } else { // Edge
        for (let [key, values] of props) {
          for (let value of values) {
            if (! edgeProps.has(key)) {
              edgeProps.set(key, typeMap[value.type()]);
            }
          }
        }
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}

function writeHeaderNodes(callback) {
  let output = ['~id', '~label'];
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = key + ':' + nodeProps.get(key);
  });
  streamNodes.write(output.join(sep) + '\n');
  callback();
}

function writeHeaderEdges(callback) {
  let output = ['~id', '~from', '~to', '~label'];
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 4] = key + ':' + edgeProps.get(key);
  });
  streamEdges.write(output.join(sep) + '\n');
  callback();
}

function writeNodesAndEdges(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  let edgeId = 0;
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      let [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 === null) { // Node
        addNode(id1, labels, props);
      } else { // Edge
        addEdge(edgeId, id1, id2, labels, props);
        edgeId += 1;
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}

function addNode(id, labels, props) {
  let output = [ id[0], labels.join(';') ];
  let lineProps = new Map();
  for (let [key, values] of props) {
    lineProps.set(key, Array.from(values).map(value => value.rmdq()).join(';'));
  }
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  streamNodes.write(output.join(sep) + '\n');
}

function addEdge(edgeId, id1, id2, labels, props) {
  var output = [ edgeId.toString(), id1[0], id2[0], labels[0] ];
  var lineProps = new Map();
  for (let [key, values] of props) {
    lineProps.set(key, Array.from(values).map(value => value.rmdq()).join(';'));
  }
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 4] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  streamEdges.write(output.join(sep) + '\n');
}
