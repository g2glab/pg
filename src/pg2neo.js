#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var commander = require('commander');
var pg = require('./pg2.js');

commander
  .version('0.2.1')
  .arguments('<pg_file_path> <output_file_prefix>')
  .action(function (pg_file_path, output_file_prefix) {
    filePg = pg_file_path;
    prefix = output_file_prefix;
    console.log(filePg);
  })
  .parse(process.argv);

var nodeProps = [];
var edgeProps = [];

var pathNodes = prefix + '.neo.nodes';
var pathEdges = prefix + '.neo.edges';

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
  var rs = fs.createReadStream(filePg);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, types, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        for (var i = 0; i < props.length; i++) { // For each property, check if it is listed
          var key = props[i][0];
          var type = props[i][2];
          if (nodeProps[key] === undefined) {
            nodeProps[key] = type;
          }
        }
      } else { // Edge
        for (var i = 0; i < props.length; i++) { // For each property, check if it is listed
          var key = props[i][0];
          var type = props[i][2];
          if (edgeProps[key] === undefined) {
            edgeProps[key] = type;
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
  var rs = fs.createReadStream(filePg);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        var output = [
          id1[0],
          labels.join(';')
        ];
        var lineProps = {};
        for (var i=0; i<props.length; i++) { // For each property, check its index
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
          id1[0], // source node
          id2[0], // target node
          labels[0]
        ];
        var lineProps = {};
        for (var i = 0; i < props.length; i++) {
          lineProps[props[i][0]] = props[i][1];
        }
        Object.keys(edgeProps).forEach((key, i) => {
          if (lineProps[key] === undefined) {
            output[i + 3] = '';
          } else {
            output[i + 3] = lineProps[key];
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
