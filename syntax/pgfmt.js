#!/usr/bin/env node

var fs = require('fs');
let path = require('path');
var readline = require('readline');
// var pg = require('../src/pg2.js');

parser = require('./pg_parser.js');

var commander = require('commander')
    .option('-o, --output_dir <DIR>', 'directory path for results', './')
    .option('-d, --debug', 'debug (output AST)')
    .arguments('<PG_FILE_PATH>')
  // .action(function (pg_file_path) {
  //   pathPg = pg_file_path;
  //   basenamePg = path.basename(pg_file_path, '.pg');
  //   prefix = path.join(commander.output_dir, basenamePg);
  //   if (!fs.existsSync(commander.output_dir)) {
  //     fs.mkdirSync(commander.output_dir, {recursive: true});
  //   }
  // })
    .version(require("../package.json").version);

commander.parse(process.argv);

let input;
if(commander.args[0]) {
  input = fs.readFileSync(commander.args[0], "utf8").toString();
} else if (process.stdin.isTTY) {
  commander.help();
} else {
  input = fs.readFileSync(process.stdin.fd).toString();
}

// console.log(input);
const syntaxTree = new parser.parse(input);
if (commander.debug) {
  debugPrint(syntaxTree);
  process.exit(0);
}

// debugPrint(syntaxTree.nodes);
const keyNested = syntaxTree.nodes.map(n => n.properties.map(prop => prop.key))
const keyArray = Array.prototype.concat.apply([], keyNested);
const keysUniq = [...new Set(keyArray)]
console.log(keysUniq)
let out = [];
keysUniq.forEach(k => out.push(k));
console.log(out.join("\t"));

// syntaxTree.nodes.forEach(n => {
//   console.log(n.id)
//   console.log(n.labels)
//   console.log(n.properties);
// });

// syntaxTree.forEach((elem) => {
  // if (line.direction) {
  //   console.log(line.from)
  // } else {
  //   console.log(line.id)
  // }
//   console.log(line.id);
// });

// let nodeProps = new Map();
// let edgeProps = new Map();

// const pathNodes = prefix + '.neo.nodes';
// const pathEdges = prefix + '.neo.edges';
// const sep = '\t';

// fs.writeFile(pathNodes, '', (err) => {});
// fs.writeFile(pathEdges, '', (err) => {});

// listProps(() => {
//   writeHeaderNodes(() => {
//     writeHeaderEdges(() => {
//       writeNodesAndEdges(() => {
//         console.log('"' + pathNodes + '" has been created.');
//         console.log('"' + pathEdges + '" has been created.');
//       });
//     });
//   });
// });

function listProps(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (pg.isLineRead(line)) {
      let [id1, id2, undirected, types, props] = pg.extractItems(line);
      if (id2 === null) {
        addProps(nodeProps, props);
      } else {
        addProps(edgeProps, props);
      }
    }
  });
  rl.on('close', () => {
    callback();
  });
}

function addProps(allProps, props) {
  for (let [key, values] of props) {
    if (values.size === 1) {
      for (let value of values) {
        if (! allProps.has(key)) {
          allProps.set(key, value.type());
        }
      }
    } else {
      let type = null;
      for (let value of values) {
        if ((type === null) || (type === value.type())) {
          type = value.type();
        } else {
          console.log('WARNING: Neo4j only allows homogeneous lists of datatypes (', type, ' and ', value.type());
        }
      }
      if ((! allProps.has(key)) || (allProps.get(key) === type)) {
        allProps.set(key, type + '[]');
      }
    }
  }
}

function writeHeaderNodes(callback) {
  let output = ['id:ID', ':LABEL'];
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = key + ':' + nodeProps.get(key);
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', (err) => {});
  callback();
}

function writeHeaderEdges(callback) {
  let output = [':START_ID', ':END_ID', ':TYPE'];
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 3] = key + ':' + edgeProps.get(key);
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', (err) => {});
  callback();
}

function writeNodesAndEdges(callback) {
  let rs = fs.createReadStream(pathPg);
  let rl = readline.createInterface(rs, {});
  rl.on('line', (line) => {
    if (pg.isLineRead(line)) {
      var [id1, id2, undirected, labels, props] = pg.extractItems(line);
      if (id2 === null) {
        addNode(id1, labels, props);
      } else {
        addEdge(id1, id2, labels, props);
      }
    }
  });
  rl.on('close', () => {
    callback();
  });
}

function addNode(id, labels, props) {
  let output = [ id[0], labels.join(';') ];
  let lineProps = new Map();
  for (let [key, values] of props) {
    lineProps.set(key, Array.from(values).map(value => value.rmdq()).join(';'));
  }
  Array.from(nodeProps.keys()).forEach((key, i) => {
    output[i + 2] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  fs.appendFile(pathNodes, output.join(sep) + '\n', (err) => {});
}

function addEdge(id1, id2, labels, props) {
  let output = [ id1[0], id2[0], labels[0] ];
  let lineProps = new Map();
  for (let [key, values] of props) {
    lineProps.set(key, Array.from(values).map(value => value.rmdq()).join(';'));
  }
  Array.from(edgeProps.keys()).forEach((key, i) => {
    output[i + 3] = (lineProps.has(key)) ? lineProps.get(key) : '';
  });
  fs.appendFile(pathEdges, output.join(sep) + '\n', (err) => {});
}


function debugPrint(object) {
  console.log(JSON.stringify(object, undefined, 2));
};
