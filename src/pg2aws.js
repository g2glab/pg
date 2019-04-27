#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

var nodeProps = {};
var edgeProps = {};

var pathNodes = prefix + '.aws.nodes';
var pathEdges = prefix + '.aws.edges';

var typeMap = { string: 'String',
                double: 'Double',
                integer: 'Int'};

fs.writeFile(pathNodes, '', function (err) {});
fs.writeFile(pathEdges, '', function (err) {});

var sep = ',';

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
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        for (let [key, val] of props) {
          if (nodeProps[key] === undefined) {
            nodeProps[key] = typeMap[val.type()];
          }
        }
      } else { // Edge
        for (let [key, val] of props) {
          if (edgeProps[key] === undefined) {
            edgeProps[key] = typeMap[val.type()];
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
  var output = ['~id', '~label'];
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = key + ':' + nodeProps[key];
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {
    callback();
  });
}

function writeHeaderEdges(callback) {
  var output = ['~id', '~from', '~to', '~label'];
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 4] = key + ':' + edgeProps[key];
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {
    callback();
  });
}

function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pathPg);
  var rl = readline.createInterface(rs, {});
  var nodeKeys = Object.keys(nodeProps);
  var edgeKeys = Object.keys(edgeProps);
  var edgeId = 0;
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
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
  var output = [ id[0], labels.join(';') ];
  var lineProps = {};
  for (let [key, val] of props) {
    lineProps[key] = val.rmdq();
  }
  Object.keys(nodeProps).forEach((key, i) => {
    output[i + 2] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {});
}

function addEdge(edgeId, id1, id2, labels, props) {
  var output = [ edgeId.toString(), id1[0], id2[0], labels[0] ];
  var lineProps = {};
  for (let [key, val] of props) {
    lineProps[key] = val.rmdq();
  }
  Object.keys(edgeProps).forEach((key, i) => {
    output[i + 4] = (lineProps[key] === undefined) ? '' : lineProps[key];
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {});
}
