#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

var fileNodes = prefix + '.json.nodes';
var fileEdges = prefix + '.json.edges';
var fileJSON = prefix + '.json';

var rs = fs.createReadStream(pathPg);
var rl = readline.createInterface(rs, {});

fs.writeFile(fileNodes, '', function (err) {});
fs.writeFile(fileEdges, '', function (err) {});
fs.writeFile(fileJSON, '', function (err) {});

rl.on('line', function(line) {
  if (pg.isLineRead(line)) {
    var [id1, id2, labels, props] = pg.extractItems(line);
    if (id2 == null) {
      addNodeLine(id1[0], labels, props);
    } else {
      addEdgeLine(id1[0], id2[0], labels, props);
    }
  }
});

rl.on('close', function() {
  var exec = require('child_process').exec;
  var cmd;
  cmd = 'echo \'{\n  "nodes": [\' >> ' + fileJSON
      + ' && sed -e "1 s/,/ /" ' + fileNodes + ' >> ' + fileJSON
      + ' && echo \'  ]\' >> ' + fileJSON
      + ' && echo \', "edges": [\' >> ' + fileJSON
      + ' && sed -e "1 s/,/ /" ' + fileEdges + ' >> ' + fileJSON
      + ' && echo \'  ]\n}\' >> ' + fileJSON
  exec(cmd, (err, stdout, stderr) => {
    if (err) { console.log(err); }
    cmd = 'rm ' + fileNodes + ' ' + fileEdges;
    exec(cmd, (err, stdout, stderr) => {
      if (err) { console.log(err); }
      console.log('"' + fileJSON + '" has been created.');
    });
  });
});

function addNodeLine(id, labels, props) {
  var output = [];
  output[0] = dq('@id') + ':' + dq(id);
  for (var i = 0; i < labels.length; i++) {
    output = output.concat(dq('@label') + ':' + dq(labels[i])); 
  }
  for (var i = 0; i < props.length; i++) {
    if (props[i][2] == 'string') {
      output = output.concat(dq(props[i][0]) + ':' + dq(props[i][1])); 
    } else {
      output = output.concat(dq(props[i][0]) + ':' + props[i][1]); 
    }
  }
  fs.appendFile(fileNodes, '  , { ' + output.join(', ') + ' }\n', function (err) {});
}

function addEdgeLine(id1, id2, labels, props) {
  var output = [];
  output[0] = dq('@from') + ':' + dq(id1);
  output[0] = dq('@to') + ':' + dq(id2);
  for (var i = 0; i < labels.length; i++) {
    output = output.concat(dq('@label') + ':' + dq(labels[i])); 
  }
  for (var i = 0; i < props.length; i++) {
    if (props[i][2] == 'string') {
      output = output.concat(dq(props[i][0]) + ':' + dq(props[i][1])); 
    } else {
      output = output.concat(dq(props[i][0]) + ':' + props[i][1]); 
    }
  }
  fs.appendFile(fileEdges, '  , { ' + output.join(', ') + ' }\n', function (err) {});
}

function dq(str) {
  return '"' + str + '"';
}

