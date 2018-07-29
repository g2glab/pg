#!/usr/bin/env node

// USAGE: $ node pg_to_pgx.js <pg_file> <prefix>
// EXAMPLE: $ node pg_to_pgx.js example/musician.gpg output/musician/musician
// OUTPUT_FILES: <prefix>.dot

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

fs.writeFile(dst_path, '', function (err) {});

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

rl.on('line', function(line) {
  if (line.charAt(0) != '#') {
    var types;
    [line, types] = pg.extractTypes(line);
    var items = line.match(/"[^"]+"|[^\s:]+/g);
    pg.checkItems(items);
    items = items.map(item => item.replace(/"/g,'')); // remove double quotes
    types = types.map(type => type.replace(/"/g,'')); // remove double quotes
    
    if (pg.isNodeLine(line)) {
      var id = items[0];
      var topLabel = id;
      var visIndex = items.indexOf('vis_label');
      if(visIndex >= 0) {
        topLabel = items[visIndex + 1];
      }
      content += '"' + id + '" [label="' + types.join(';') + '\\l' + topLabel + '\\l';
      for (var i=1; i<items.length-1; i=i+2) {
        if(i == visIndex) continue;
        content += items[i] + ': ' + items[i+1] + '\\l'; 
      }
      content += '"]\n'
    } else {
      content += '"' + items[0] + '" -> "' + items[1] + '" [label="' + types.join(';') + "\\l";
      for (var i=2; i<items.length-1; i=i+2) {
        content += items[i] + ': ' + items[i+1] + '\\l'; 
      }
      content += '"]\n';
    }
  }
});

rl.on('close', function() {
  console.log('"' + dst_path + '" has been created.');
  fs.writeFile(dst_path, 'digraph{\n' + content + '}', function (err) {});  
});
