#!/usr/bin/env node

const util = require("./util.js");
let commander = require('commander');
let fs = require('fs');
let pgObject;

commander.
  version(require("../package.json").version).
  arguments('<json_file_path>').
  action((path) => {
    pgObject = JSON.parse(fs.readFileSync(path));
  });
commander.parse(process.argv);

for(let node of pgObject.nodes) {
  let nodeContents = [node.id.quoteIfNeeded()];
  for(let label of node.labels) {
    nodeContents.push(':' + label.quoteIfNeeded());
  }
  for(let property in node.properties) {
    for(let value of node.properties[property]) {
      nodeContents.push(property.quoteIfNeeded() + ':' + value.quoteIfNeeded());
    }
  }
  console.log(nodeContents.join("  "));
}


for(let edge of pgObject.edges) {
  let edgeContents = [edge.from.quoteIfNeeded(), edge.undirected ? '--' : '->', edge.to.quoteIfNeeded()];
  for(let label of edge.labels) {
    edgeContents.push(':' + label.quoteIfNeeded());
  }
  for(let property in edge.properties) {
    for(let value of edge.properties[property]) {
      edgeContents.push(property.quoteIfNeeded() + ':' + value.quoteIfNeeded());
    }
  }
  console.log(edgeContents.join("  "));
}
