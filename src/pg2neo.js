#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

var nodeProps = [];
var edgeProps = [];

var pathNodes = prefix + '.neo.nodes';
var pathEdges = prefix + '.neo.edges';

fs.writeFile(pathNodes, '', function (err) {});
fs.writeFile(pathEdges, '', function (err) {});

const sep = '\t';

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
  var rs = fs.createReadStream(pathPg);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, types, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        for (let [key, values] of props) { // For each property, check if it is listed
          for (let value of values) {
            if (nodeProps[key] === undefined) {
              nodeProps[key] = value.type();
            }
          }
        }
      } else { // Edge
        for (let [key, values] of props) { // For each property, check if it is listed
          for (let value of values) {
            if (edgeProps[key] === undefined) {
              edgeProps[key] = value.type();
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
  var output = ['id:ID', ':LABEL'];
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = key;
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeHeaderEdges(callback) {
  var output = [':START_ID', ':END_ID', ':TYPE'];
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 3] = key;
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pathPg);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        addNode(id1, labels, props);
      } else { // Edge
        addEdge(id1, id2, labels, props);
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}

function addNode(id, labels, props) {
  var output = [ id[0], labels.join(';') ];
  var lineProps = {};
  for (let [key, values] of props) {
    lineProps[key] = Array.from(values).map(value => value.rmdq()).join(';');
  }
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {});
}

function addEdge(id1, id2, labels, props) {
  var output = [ id1[0], id2[0], labels[0] ];
  var lineProps = {};
  for (let [key, values] of props) {
    lineProps[key] = Array.from(values).map(value => value.rmdq()).join(';');
  }
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 3] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {});
}
