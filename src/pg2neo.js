#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

let nodeProps = new Map();
let edgeProps = new Map();

const pathNodes = prefix + '.neo.nodes';
const pathEdges = prefix + '.neo.edges';
const sep = '\t';

fs.writeFile(pathNodes, '', (err) => {});
fs.writeFile(pathEdges, '', (err) => {});

listProps(() => {
  writeHeaderNodes(() => {
    writeHeaderEdges(() => {
      writeNodesAndEdges(() => {
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
      let [id1, id2, undirected, types, props] = pg.extractItems(line);
      if (id2 === null) {
        for (let [key, values] of props) {
          for (let value of values) {
            if (! nodeProps.has(key)) {
              nodeProps.set(key, value.type());
            }
          }
        }
      } else {
        for (let [key, values] of props) {
          for (let value of values) {
            if (! edgeProps.has(key)) {
              edgeProps.set(key, value.type());
            }
          }
        }
      }
    }
  });
  rl.on('close', () => {
    callback();
  });
}

function writeHeaderNodes(callback) {
  let output = ['id:ID', ':LABEL'];
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = key;
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', (err) => {});
  callback();
}

function writeHeaderEdges(callback) {
  let output = [':START_ID', ':END_ID', ':TYPE'];
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 3] = key;
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', (err) => {});
  callback();
}

function writeNodesAndEdges(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  rl.on('line', (line) => {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 === null) {
        addNode(id1, labels, props);
      } else {
        addEdge(id1, id2, labels, props);
      }
    }
  });
  rl.on('close', () => {
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
  fs.appendFile(pathNodes, output.join(sep) + '\n', (err) => {});
}

function addEdge(id1, id2, labels, props) {
  let output = [ id1[0], id2[0], labels[0] ];
  let lineProps = new Map();
  for (let [key, values] of props) {
    lineProps.set(key, Array.from(values).map(value => value.rmdq()).join(';'));
  }
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 3] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', (err) => {});
}
