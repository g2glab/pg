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
      var [id1, id2, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        for (var i = 0; i < props.length; i++) { // For each property, check if it is listed
          var [key, val, type] = props[i];
          if (nodeProps[key] === undefined) {
            nodeProps[key] = typeMap[type];
          }
        }
      } else { // Edge
        for (var i = 0; i < props.length; i++) { // For each property, check if it is listed
          var [key, val, type] = props[i];
          if (edgeProps[key] === undefined) {
            edgeProps[key] = typeMap[type];
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
      var [id1, id2, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        var output = [];
        output[0] = id1[0];
        output[1] = labels.join(';');
        var lineProps = {};
        for (var i = 0; i < props.length; i++) { // For each property, check its index
          lineProps[props[i][0]] = props[i][1];
        }
        Object.keys(nodeProps).forEach((key, i) => {
          if (lineProps[key] === undefined) {
            output[i + 2] = '';
          } else {
            output[i + 2] = lineProps[key];
          }
        });
        fs.appendFile(pathNodes, output.join(sep) + '\n', function (err) {});
      } else { // Edge
        var output = [
          edgeId.toString(),
          id1[0], // source node
          id2[0], // target node
          labels[0]
        ];
        edgeId += 1;
        var lineProps = {};
        for (var i = 0; i < props.length; i++) {
          lineProps[props[i][0]] = props[i][1];
        }
        Object.keys(edgeProps).forEach((key, i) => {
          if (lineProps[key] === undefined) {
            output[i + 4] = '';
          } else {
            output[i + 4] = lineProps[key];
          }
        });
        fs.appendFile(pathEdges, output.join(sep) + '\n', function (err) {});
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}
