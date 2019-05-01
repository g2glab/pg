#!/usr/bin/env node

let fs = require('fs');
let readline = require('readline');
let pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

const pathDot = prefix + '.dot';
fs.writeFile(pathDot, '', function (err) {}); // Overwrite if file exists

const graphName = prefix;
fs.appendFile(pathDot, 'digraph "' + graphName + '" {\n', function (err) {

  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});

  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, properties] = pg.extractItems(line);
      if (id2 === null) { // Node
        addNodeLine(id1, labels, properties);
      } else { // Edge
        addEdgeLine(id1, id2, undirected, labels, properties);
      }
    }
  });

  rl.on('close', function() {
    fs.appendFile(pathDot, '}', function (err) {
      console.log('"' + pathDot + '" has been created.');
    });  
  });
});

function addNodeLine(id, labels, properties) {
  let strLabel = 'label="' + labels.join(';') + '\\l';
  let strProps = '';
  let visLabel = id[0] + '\\l';
  for (let [key, values] of properties) {
    let strValues = Array.from(values).map(value => value.rmdq()).join(';');
    if (key == 'vis_label') {
      visLabel += strValues + '\\l';
    } else {
      strProps += ' ' + key + '="' + strValues + '"';
    }
  }
  strLabel += visLabel + '"';
  let output = '"' + id[0] + '" [' + strLabel + strProps + ']';
  fs.appendFile(pathDot, output + '\n', function (err) {});
}

function addEdgeLine(id1, id2, undirected, labels, properties) {
  let strProps = '';
  let visLabel = '';
  for (let [key, values] of properties) {
    let strValues = Array.from(values).map(value => value.rmdq()).join(';');
    if (key == 'vis_label') {
      visLabel += strValues + '\\l';
    } else {
      strProps += ' ' + key + '="' + strValues + '"';
    }
  }
  let strLabel = 'label="' + labels.join(';') + '\\l' + visLabel + '"';
  let strDir = (undirected) ? ' dir=none' : '';
  let output = '"' + id1[0] + '" -> "' + id2[0] + '" [' + strLabel + strProps + strDir + ']';
  fs.appendFile(pathDot, output + '\n', function (err) {});
}
