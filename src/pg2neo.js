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

var sep = '\t';

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
        for (key in props) { // For each property, check if it is listed
          if (nodeProps[key] === undefined) {
            nodeProps[key] = props[key].type();
          }
        }
      } else { // Edge
        for (key in props) { // For each property, check if it is listed
          if (edgeProps[key] === undefined) {
            edgeProps[key] = props[key].type();
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
  for (key in props) {
    lineProps[key] = props[key].rmdq();
  }
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {});
}

function addEdge(id1, id2, labels, props) {
  var output = [ id1[0], id2[0], labels[0] ];
  var lineProps = {};
  for (key in props) {
    lineProps[key] = props[key].rmdq();
  }
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 3] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {});
}
