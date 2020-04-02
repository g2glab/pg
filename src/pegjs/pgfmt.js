#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('./pg_parser.js');

const commander = require('commander')
      .option('-f, --format <FORMAT>', 'json, neo', 'default')
      .option('-o, --output_dir <DIR>', 'directory path for results', './')
      .arguments('<PG_FILE_PATH>')
      .version(require("../../package.json").version);

commander.parse(process.argv);

// Get input and output file names
let inputText;

let outFilePrefix;
if(commander.args[0]) {
  const inputFile = commander.args[0];
  const basename = path.basename(inputFile, '.pg');
  inputText = fs.readFileSync(inputFile, "utf8").toString();
  outFilePrefix = path.join(commander.output_dir, basename);
  if (!fs.existsSync(commander.output_dir)) {
    fs.mkdirSync(commander.output_dir, {recursive: true});
  }
} else if (process.stdin.isTTY) {
  commander.help();
} else {
  inputText = fs.readFileSync(process.stdin.fd).toString();
  outFilePrefix = 'pgfmt';
}

const nodeFile = outFilePrefix + '.neo.nodes';
const edgeFile = outFilePrefix + '.neo.edges';

// Parse PG file
const objectTree = new parser.parse(inputText);
const nodeProps = Object.keys(objectTree.nodeProperties);
const edgeProps = Object.keys(objectTree.edgeProperties);
const basicProps = ['nodes', 'edges', 'id', 'from', 'to', 'direction', 'labels', 'properties'];

if (commander.format) {
  switch (commander.format) {
    case 'default':
      // print the whole object tree
      printJSON(objectTree);
      process.exit(0);
      break;
    case 'json':
      // print selected properties for JSON-PG
      printJSON(objectTree, basicProps.concat(nodeProps).concat(edgeProps));
      process.exit(0);
      break;
    case 'neo':
      break;
  }
}

// Output nodes
let nodeHeader = ['id:ID', ':LABEL'];
nodeHeader = nodeHeader.concat(nodeProps);

let nodeLines = [];

nodeLines.push(nodeHeader.join('\t'));

objectTree.nodes.forEach(n => {
  let line = [];
  line.push(n.id)
  line.push(n.labels)
  nodeProps.forEach(p => {
    if (n.properties[p]) {
      line.push(n.properties[p].join(';'));
    } else {
      line.push('');
    }
  });
  nodeLines.push(line.join('\t'));
});

fs.writeFile(nodeFile, nodeLines.join('\n') + '\n', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`"${nodeFile}" has been created.`);
  }
});

// Output edges
let edgeHeader = [':START_ID', ':END_ID', ':TYPE'];
edgeHeader = edgeHeader.concat(edgeProps);

let edgeLines = [];
edgeLines.push(edgeHeader.join('\t'));

objectTree.edges.forEach(e => {
  let line = [];
  line.push(e.from, e.to)
  line.push(e.labels)
  edgeProps.forEach(p => {
    if (e.properties[p]) {
      line.push(e.properties[p].join(';'));
    } else {
      line.push('');
    }
  });
  edgeLines.push(line.join('\t'));
});

fs.writeFile(edgeFile, edgeLines.join('\n') + '\n', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`"${edgeFile}" has been created.`);
  }
});

// Function
function printJSON(object, selected=null) {
  console.log(JSON.stringify(object, selected, 2));
};
