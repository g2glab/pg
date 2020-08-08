#!/usr/bin/env node

let fs = require('fs');
let readline = require('readline');
let pg = require('./pg2.js');

pg.commander.parse(process.argv);
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

const pathDot = prefix + '.dot';
const streamDot = fs.createWriteStream(pathDot);

const graphName = prefix;
streamDot.write('digraph "' + graphName + '" {\n');

function addNodeLine(id, labels, properties) {
  let strLabel = 'label="' + labels.join(';') + '\\l';
  let strProps = '';
  let visLabel = id[0] + '\\l';
  for (let [key, values] of properties) {
    let strValues = Array.from(values).map(value => value.rmdq()).join(';');
    if (key == 'vis_label') {
      visLabel += strValues + '\\l';
    } else {
      strProps += `${key}:${strValues}\\l`;
    }
  }
  strLabel += visLabel;
  let output = '"' + id[0] + '" [' + strLabel + strProps + '"]';
  streamDot.write(output + '\n');
}

function addEdgeLine(id1, id2, undirected, labels, properties) {
  let strProps = '';
  let visLabel = '';
  for (let [key, values] of properties) {
    let strValues = Array.from(values).map(value => value.rmdq()).join(';');
    if (key == 'vis_label') {
      visLabel += strValues + '\\l';
    } else {
      strProps += `${key}:${strValues}\\l`;
    }
  }
  let strLabel = 'label="' + labels.join(';') + '\\l' + visLabel;
  let strDir = (undirected) ? ' dir=none' : '';
  let output = '"' + id1[0] + '" -> "' + id2[0] + '" [' + strLabel + strProps + '"' + strDir + ']';
  streamDot.write(output + '\n');
}


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
  streamDot.write('}');
  console.log('"' + pathDot + '" has been created.');
});
