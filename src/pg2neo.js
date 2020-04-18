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
const nodeStream = fs.createWriteStream(pathNodes);
const pathEdges = prefix + '.neo.edges';
const edgeStream = fs.createWriteStream(pathEdges);
const sep = '\t';


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
        addProps(nodeProps, props);
      } else {
        addProps(edgeProps, props);
      }
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
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = key + ':' + nodeProps.get(key);
  });
  nodeStream.write(output.join(sep) + '\n', (err) => {});
  callback();
}

function writeHeaderEdges(callback) {
  let output = [':START_ID', ':END_ID', ':TYPE'];
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 3] = key + ':' + edgeProps.get(key);
  });
  edgeStream.write(output.join(sep) + '\n');
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
    nodeStream.end();
    edgeStream.end();
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
  nodeStream.write(output.join(sep) + '\n');
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
  edgeStream.write(output.join(sep) + '\n');
}
