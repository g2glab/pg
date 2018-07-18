#!/usr/bin/env node

// USAGE: $ pg_to_aws <pg_file> <prefix>
// OUTPUT_DIR: output/
// OUTPUT_FILES: <prefix>.aws.nodes <prefix>.aws.edges

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg_to.js');

var node_props = {type: null};
var edge_props = {type: null};

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
            node_props[key] = typeMap[type];
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
  var output = [];
  output[0] = '~id';
  Object.keys(node_props).forEach((key, i) => 
  {
    if (key == 'type') {
      output[i + 1] = '~label';
    } else {
      output[i + 1] = unstringify(key) + ':' + node_props[key];
    }
  });
  fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeHeaderEdges(callback) {
  var output = ['~id', '~from', '~to'];
  Object.keys(edge_props).forEach((key, i) => {
    if (key == 'type') {
      output[i + 3] = '~label';
    } else {
      output[i + 3] = unstringify(key) + ':' + edge_props[key];
    }    
  });
  fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
  callback();
}

function unstringify(src) {
  return src.replace(/^"/g, '').replace(/"$/g, '');
}

function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  var nodeKeys = Object.keys(node_props);
  var edgeKeys = Object.keys(edge_props);
  var edgeId = 0;
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      var types;
      [line, types] = pg.extractTypes(line);
      var items = line.match(/"[^"]+"|[^\s:]+/g); // "...." or .... (separated by : or \s)
      pg.checkItems(items);
      if (pg.isNodeLine(line)) {
        // This line is a node
        var id = items[0];
        var output = [];
        output[0] = unstringify(id);
        output[1] = unstringify(types.join(';'));
        // For each property, check its index
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          if(node_props[key] != 'String') {
            val = unstringify(val);
          }
          var index = nodeKeys.indexOf(key);
          if (index != -1) {
            output[index + 1] = val;
          } else {
            console.log('WARNING: This node property is not defined: ' + key);
          }
        }
        fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
      } else {
        // This line is a edge
        var output = [
          edgeId.toString(),
          unstringify(items[0]), // source node
          unstringify(items[1]), // target node
          unstringify(types[0])
        ];
        edgeId += 1;
        // For each property, add 1 line
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var index = edgeKeys.indexOf(key);
          if(edge_props[key] != 'String') {
            val = unstringify(val);
          }
          if (index != -1) {
            output[index + 3] = val;
          } else {
            console.log('WARNING: This edge property is not defined: ' + key);
          }
        }
        fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}
