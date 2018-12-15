#!/usr/bin/env node

var pgFile = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

var node_props = {};
var edge_props = {};

var path_nodes = prefix + '.aws.nodes';
var path_edges = prefix + '.aws.edges';

var typeMap = { string: 'String',
                double: 'Double',
                integer: 'Int'};

fs.writeFile(path_nodes, '', function (err) {});
fs.writeFile(path_edges, '', function (err) {});

var sep = ',';

listProps(function() {
  writeHeaderNodes(function() {
    writeHeaderEdges(function() {
      writeNodesAndEdges(function() {
        console.log('"' + path_nodes + '" has been created.');
        console.log('"' + path_edges + '" has been created.');
      });
    });
  });
});

function listProps(callback) {
  var rs = fs.createReadStream(pgFile);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id_1, id_2, types, props] = pg.extractItems(line);
      if (id_2 == null) { // Node
        for (var i=0; i<props.length; i++) { // For each property, check if it is listed
          var key = props[i][0];
          var val = props[i][1];
          var type = pg.evalType(val);
          if (node_props[key] === undefined) {
            node_props[key] = typeMap[type];
          }
        }
      } else { // Edge
        for (var i=0; i<props.length; i++) { // For each property, check if it is listed
          var key = props[i][0];
          var val = props[i][1];
          var type = pg.evalType(val);
          if (edge_props[key] === undefined) {
            edge_props[key] = typeMap[type];
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
  Object.keys(node_props).forEach((key, i) => {
    output[i + 2] = key + ':' + node_props[key];
  });
  fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeHeaderEdges(callback) {
  var output = ['~id', '~from', '~to', '~label'];
  Object.keys(edge_props).forEach((key, i) => {
    output[i + 4] = key + ':' + edge_props[key];
  });
  fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pgFile);
  var rl = readline.createInterface(rs, {});
  var nodeKeys = Object.keys(node_props);
  var edgeKeys = Object.keys(edge_props);
  var edgeId = 0;
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id_1, id_2, types, props] = pg.extractItems(line);
      if (id_2 == null) { // Node
        var output = [];
        output[0] = id_1;
        output[1] = types.join(';');
        var lineProps = {};
        for (var i=0; i<props.length; i++) { // For each property, check its index
          lineProps[props[i][0]] = props[i][1];
        }
        Object.keys(node_props).forEach((key, i) => {
          if (lineProps[key] === undefined) {
            output[i + 2] = '';
          } else {
            if (node_props[key] != 'String') {
              output[i + 2] = lineProps[key];
            } else {
              output[i + 2] = lineProps[key];
            }
          }
        });
        fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
      } else { // Edge
        console.log(id_1, id_2, types[0]);
        var output = [
          edgeId.toString(),
          id_1, // source node
          id_2, // target node
          types[0]
        ];
        edgeId += 1;
        var lineProps = {};
        for (var i=0; i<props.length; i++) {
          lineProps[props[i][0]] = props[i][1];
        }
        Object.keys(edge_props).forEach((key, i) => {
          if(lineProps[key] === undefined)
          {
            output[i + 4] = '';
          } else {
            if(edge_props[key] != 'String') {
              output[i + 4] = lineProps[key];
            } else {
              output[i + 4] = lineProps[key];
            }
          }
        });
        fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}
