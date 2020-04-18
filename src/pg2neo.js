#!/usr/bin/env node

String.prototype.quoteIfNeeded = function() {
  if(this.includes('"') || this.includes('\t')) {
    return `"${this.replace('"', '""')}"`;
  }
  return this;
}

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');
var lineParser = require('./pegjs/pg_line_parser.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

let nodeProps = {};
let edgeProps = {};

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
    const parsed = lineParser.parse(line);
    if(parsed.node) {
      addProps(nodeProps, parsed.node.properties);
    } else if(parsed.edge) {
      addProps(edgeProps, parsed.edge.properties);
    }
  });
  rl.on('close', () => {
    callback();
  });
}

function addProps(allProps, props) {
  for (let [key, values] of Object.entries(props)) {
    if (values.size === 1) {
      for (let value of values) {
        if (!allProps[key]) {
          allProps[key] = 'string';
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
      if ((! allProps[key]) || (allProps[key] === type)) {
        //        allProps[key] = type + '[]';
        allProps[key] = 'string';
      }
    }
  }
}

function writeHeaderNodes(callback) {
  let output = ['id:ID', ':LABEL'];
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = key + ':' + nodeProps[key];
  });
  nodeStream.write(output.join(sep) + '\n', (err) => {});
  callback();
}

function writeHeaderEdges(callback) {
  let output = [':START_ID', ':END_ID', ':TYPE'];
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 3] = key + ':' + edgeProps[key];
  });
  edgeStream.write(output.join(sep) + '\n');
  callback();
}

function writeNodesAndEdges(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  rl.on('line', (line) => {
    const parsed = lineParser.parse(line);
    if(parsed.node) {
      const node = parsed.node;
      addNode(node.id, node.labels, node.properties);
    } else if(parsed.edge) {
      const edge = parsed.edge;
      addEdge(edge.from, edge.to, edge.labels, edge.properties);
    }
  });
  rl.on('close', () => {
    nodeStream.end();
    edgeStream.end();
    callback();
  });
}

function addNode(id, labels, props) {
  let output = [ id, labels.join(';') ];
  let lineProps = new Map();
  for (let [key, values] of Object.entries(props)) {
    lineProps.set(key, values.map(value => value.rmdq()).join(';').quoteIfNeeded());
  }
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  nodeStream.write(output.join(sep) + '\n');
}

function addEdge(id1, id2, labels, props) {
  let output = [ id1, id2, labels[0] ];
  let lineProps = new Map();
  for (let [key, values] of Object.entries(props)) {
    lineProps.set(key, values.map(value => value.rmdq()).join(';').quoteIfNeeded());
  }
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 3] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  edgeStream.write(output.join(sep) + '\n');
}

