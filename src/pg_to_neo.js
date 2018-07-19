#!/usr/bin/env node

// USAGE: $ node pg_to_neo.js <pg_file> <prefix>
// OUTPUT_DIR: output/
// OUTPUT_FILES: <prefix>.neo.nodes <prefix>.neo.edges

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg_to.js');

var node_props = [];
var edge_props = [];

var path_nodes = prefix + '.neo.nodes';
var path_edges = prefix + '.neo.edges';

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
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      [line, types] = pg.extractTypes(line);
      var items = line.match(/"[^"]+"|[^\s:]+/g); // "...." or .... (separated by : or \s)
      pg.checkItems(items);
      if (pg.isNodeLine(line)) {
        // This line is a node
        // For each property, check if it is listed
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var type = pg.evalType(val);
          if (node_props[key] === undefined) {
            node_props[key] = type;
          }
        }
      } else {
        // This line is a edge
        // For each property, check if it is listed
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var type = pg.evalType(val);
          if (edge_props[key] === undefined) {
            edge_props[key] = type;
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
  Object.keys(node_props).forEach((key, i) => 
  {
    output[i + 2] = key;
  });
  fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeHeaderEdges(callback) {
  var output = [':START_ID', ':END_ID', ':TYPE'];
  Object.keys(edge_props).forEach((key, i) => {
    output[i + 3] = key;
  });
  fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
  callback();
}


function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      var types;
      [line, types] = pg.extractTypes(line);
      var items = line.match(/"[^"]+"|[^\s:]+/g); // "...." or .... (separated by : or \s)
      pg.checkItems(items);
      if (pg.isNodeLine(line)) {
        // This line is a node
        var id = items[0];
        var output = [
          id,
          types.join(';')
        ];
        // For each property, check its index
        var lineProps = {};
        // For each property, check its index
        for (var i=1; i<items.length-1; i=i+2) {
          lineProps[items[i]] = items[i+1];
        }
        Object.keys(node_props).forEach((key, i) => {
          if(lineProps[key] === undefined)
          {
            output[i + 2] = '';
          } else {
            output[i + 2] = lineProps[key];
          }
        });
        fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
      } else {
        // This line is a edge
        var output = [
          items[0], // source node
          items[1], // target node
          types[0]
        ];
        // For each property, add 1 line
        var lineProps = {};
        for (var i=1; i<items.length-1; i=i+2) {
          lineProps[items[i]] = items[i+1];
        }
        Object.keys(edge_props).forEach((key, i) => {
          if(lineProps[key] === undefined)
          {
            output[i + 3] = '';
          } else {
            output[i + 3] = lineProps[key];
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
