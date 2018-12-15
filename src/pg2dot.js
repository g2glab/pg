#!/usr/bin/env node

var pg_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');

var rs = fs.createReadStream(pg_file);
var rl = readline.createInterface(rs, {});

var node_props = [];
var edge_props = [];
var node_props_type = [];
var edge_props_type = [];

var dst_path = prefix + '.dot';

var sep = ',';
var content = '';

//fs.writeFile(dst_path, '', function (err) {});

rl.on('line', function(line) {
  if (pg.isLineRead(line)) {
    var [id_1, id_2, types, props] = pg.extractItems(line);
    if (id_2 == null) { // Node
      var topLabel = id_1;
      var visIndex = props.indexOf('vis_label');
      if (visIndex >= 0) {
        topLabel = props[visIndex + 1];
      }
      content += '"' + id_1 + '" [label="' + types.join(';') + '\\l' + topLabel + '\\l';
      for (var i = 0; i < props.length; i++) {
        if (i == visIndex) continue;
        content += props[i][0] + ': ' + props[i][1] + '\\l'; 
      }
      content += '"]\n'
    } else { // Edge
      content += '"' + id_1 + '" -> "' + id_2 + '" [label="' + types.join(';') + "\\l";
      for (var i = 0; i < props.length; i++) {
        content += props[i][0] + ': ' + props[i][1] + '\\l'; 
      }
      content += '"]\n';
    }
  }
});

rl.on('close', function() {
  console.log('"' + dst_path + '" has been created.');
  fs.writeFile(dst_path, 'digraph{\n' + content + '}', function (err) {});  
});
