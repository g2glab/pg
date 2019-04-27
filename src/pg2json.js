#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;

var fileJSON = prefix + '.json';

var rs = fs.createReadStream(pathPg);
var rl = readline.createInterface(rs, {});

fs.writeFile(fileJSON, '', function (err) {});

var graph = { nodes:[], edges:[] };

rl.on('line', function(line) {
  if (pg.isLineRead(line)) {
    var [id1, id2, undirected, labels, props] = pg.extractItems(line);
    if (id2 == null) {
      addNodeLine(id1[0], labels, props);
    } else {
      addEdgeLine(id1[0], id2[0], undirected, labels, props);
    }
  }
});

rl.on('close', function() {
  fs.appendFile(fileJSON, JSON.stringify(graph, null, 2), function (err) {
    if (err) { console.log(err); }
    console.log('"' + fileJSON + '" has been created.');
  });
});

function addNodeLine(id, labels, props) {
if (props) {console.log(props.valueOf())};
  var node = {};
  node['id'] = id;
  node['labels'] = labels;
  node['properties'] = mapToObject(props);
  graph.nodes.push(node);
}

function addEdgeLine(id1, id2, undirected, labels, props) {
  var edge = {};
  edge['from'] = id1;
  edge['to'] = id2;
  edge['labels'] = labels;
  edge['properties'] = mapToObject(props);
  if (undirected) {
    edge['undirected'] = undirected;
  }
  graph.edges.push(edge);
}

function mapToObject(map) {
  let result = {};
  for ([key, value] of map) {
    result[key] = value;
  }
  return result;
}
