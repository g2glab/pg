#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var commander = require('commander');

commander
  .version('0.2.1')
  .arguments('<elist_file_path> <config_file_path> <output_file_prefix>')
  .action(function (elist_file_path, config_file_path, output_file_prefix) {
    pathElist = elist_file_path;
    pathConfig = config_file_path;
    prefix = output_file_prefix;
  })
  .parse(process.argv);

isLineRead = function (line) {
  if (line.charAt(0) != '#' && line != '') {
    return true;
  } else {
    return false;
  }
}

var filePg = prefix + '.elist.pg';
var sep = ',';

fs.writeFile(filePg, '', function (err) {});

fs.readFile(pathConfig, 'utf-8', function (err, data) {
  if (err) { throw err; }
  config = JSON.parse(data);

  var rs = fs.createReadStream(pathElist);
  var rl = readline.createInterface(rs, {});

  rl.on('line', function(line) {
    if (isLineRead(line)) {
      var vals = line.split('\t');
      var output = [];
      if (vals[1] == '*') { // NODE
        output[0] = vals[0] // ID
        var j = 1;
        for (var i = 2; i < vals.length; i++) {
          if (vals[i] != '""' && vals[i] != 0) {
            output[j] = config.vertex_props[i - 2].name + ':' +  vals[i];
            j++;
          }
        }
      } else {              // EDGE
        output[0] = vals[0] // FROM
        output[1] = vals[1] // TO
        var j = 2;
        if (vals[2]) {
          output[2] = ':' + vals[2].replace(/^"(.+)"$/, '$1'); // LABEL
          j++;
        }
        for (var i = 3; i < vals.length; i++) {
          if (vals[i] != '""' && vals[i] != 0) {
            output[j] = config.edge_props[i - 3].name + ':' +  vals[i];
            j++;
          }
        }
      }
      fs.appendFile(filePg, output.join('\t') + '\n', function (err) {});
    }
  });

  rl.on('close', function() {
    console.log('"' + filePg + '" has been created.');
  });
});
