#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

var pathDot = prefix + '.dot';

fs.writeFile(pathDot, '', function (err) {});

var graphName = prefix;
fs.appendFile(pathDot, 'digraph "' + graphName + '" {\n', function (err) {

  var rs = fs.createReadStream(pathPg);
  var rl = readline.createInterface(rs, {});

  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 == null) { // Node
        addNodeLine(id1, labels, props);
      } else { // Edge
        addEdgeLine(id1, id2, undirected, labels, props);
      }
    }
  });

  rl.on('close', function() {
    fs.appendFile(pathDot, '}', function (err) {
      console.log('"' + pathDot + '" has been created.');
    });  
  });
});

function addNodeLine(id, labels, props) {
  var strLabel = 'label="' + labels.join(';') + '\\l';
  var strProps = '';
  var visLabel = id[0] + '\\l';
  for (let [key, val] of props) {
    if (key == 'vis_label') {
      visLabel = val.rmdq() + '\\l';
    } else {
      strProps += ' ' + key + '="' + val.rmdq() + '"';
    }
  }
  strLabel += visLabel + '"';
  var output = '"' + id[0] + '" [' + strLabel + strProps + ']';
  fs.appendFile(pathDot, output + '\n', function (err) {});
}

function addEdgeLine(id1, id2, undirected, labels, props) {
  var strProps = '';
  var visLabel = '';
  for (let [key, val] of props) {
    if (key == 'vis_label') {
      visLabel += val.rmdq() + '\\l';
    } else {
      strProps += ' ' + key + '="' + val.rmdq() + '"';
    }
  }
  var strLabel = 'label="' + labels.join(';') + '\\l' + visLabel + '"';
  var strDir = (undirected) ? ' dir=none' : '';
  var output = '"' + id1[0] + '" -> "' + id2[0] + '" [' + strLabel + strProps + strDir + ']';
  fs.appendFile(pathDot, output + '\n', function (err) {});
}
