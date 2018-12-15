#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

pg.commander;
if (pg.commander.args.length === 0) {
  console.error("Error: no argument is given!");
  pg.commander.help();
}

var rs = fs.createReadStream(pathPg);
var rl = readline.createInterface(rs, {});

var pathDot = prefix + '.dot';
var sep = ',';
var content = '';

rl.on('line', function(line) {
  if (pg.isLineRead(line)) {
    var [id1, id2, labels, props] = pg.extractItems(line);
    if (id2 == null) { // Node
      var topLabel = id1;
      var visIndex = props.indexOf('vis_label');
      if (visIndex >= 0) {
        topLabel = props[visIndex + 1];
      }
      content += '"' + id1 + '" [label="' + labels.join(';') + '\\l' + topLabel + '\\l';
      for (var i = 0; i < props.length; i++) {
        if (i == visIndex) continue;
        content += props[i][0] + ': ' + props[i][1] + '\\l'; 
      }
      content += '"]\n'
    } else { // Edge
      content += '"' + id1 + '" -> "' + id2 + '" [label="' + labels.join(';') + "\\l";
      for (var i = 0; i < props.length; i++) {
        content += props[i][0] + ': ' + props[i][1] + '\\l'; 
      }
      content += '"]\n';
    }
  }
});

rl.on('close', function() {
  fs.writeFile(pathDot, 'digraph{\n' + content + '}', function (err) {
    console.log('"' + pathDot + '" has been created.');
  });  
});
