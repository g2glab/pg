#!/usr/bin/env node

// USAGE: $ node pg2pgx.js <pg_file_path> <output_file_prefix>
// EXAMPLE: $ node pg2pgx.js example/musician.pg output/musician/musician
// OUTPUT_FILES: <prefix>.pgx.nodes <prefix>.pgx.edges <prefix>.json

var fs = require('fs');
var readline = require('readline');
var commander = require('commander');
var pg = require('./pg2.js');

commander
  .version('0.1.0')
  .arguments('<pg_file_path> <output_file_prefix>')
  .action(function (pg_file_path, output_file_prefix) {
    filePg = pg_file_path;
    prefix = output_file_prefix;
    console.log(filePg);
  })
  .parse(process.argv);

if (commander.args.length === 0) {
  console.error("Error: no argument is given!");
  commander.help();
}

var cntNodes = 0;
var cntEdges = 0;

var arrNodeProp = [];
var arrEdgeProp = [];
var arrNodePropType = [];
var arrEdgePropType = [];

var fileNodes = prefix + '.pgx.nodes';
var fileEdges = prefix + '.pgx.edges';
var fileConfig = prefix + '.pgx.json';

var sep = ',';

var rs = fs.createReadStream(filePg);
var rl = readline.createInterface(rs, {});

fs.writeFile(fileNodes, '', function (err) {});
fs.writeFile(fileEdges, '', function (err) {});
fs.writeFile(fileConfig, '', function (err) {});

rl.on('line', function(line) {
  if (line.charAt(0) != '#' && line != '') {
    var types;
    [line, types] = pg.extractTypes(line);
    var items = line.match(/"[^"]*"|[^\s:]+|:/g); // double quoted OR string (no space or colon) OR just a colon
    if (items[2]==":") {
      addNodeLine(items);
    } else {
      var label = types[0].replace(/"/g,'');
      addEdgeLine(items, label);
    }
  }
});

rl.on('close', function() {
  console.log('"' + fileNodes + '" has been created.');
  console.log('"' + fileEdges + '" has been created.');
  createLoadConfig();
});

function addNodeLine(items) {
  cntNodes++;
  var id = items[0].replace(/"/g,'');
  // For each property, add 1 line
  //items = items.concat(flatten(types.map(type => ['type', type])));
  if (items.length == 1) {
    // When this node has no property
    var output = [];
    output[0] = id;
    output[1] = '%20'; // %20 means 'no property' in PGX syntax
    output = output.concat(format('', 'none'));
    fs.appendFile(fileNodes, output.join(sep) + '\n', function (err) {});
  } else {
    for (var i=1; i<items.length-1; i=i+3) {
      var key = items[i].replace(/"/g,''); 
      var val = items[i+2].replace(/"/g,'');
      var type = pg.evalType(items[i+2]);
      var output = [];
      output[0] = id;
      output[1] = key;
      output = output.concat(format(val, type));
      fs.appendFile(fileNodes, output.join(sep) + '\n', function (err) {});
      if (arrNodeProp.indexOf(key) == -1) {
        var prop = { name: key, type: type };
        arrNodeProp.push(key); 
        arrNodePropType.push(prop); 
      }
    }
  }
}

function addEdgeLine(items, label) {
  cntEdges++;
  if (items.length == 2) {
    // When this edge has no property
    var output = [];
    output[0] = cntEdges; // edge id
    output[1] = items[0].replace(/"/g,''); // source node
    output[2] = items[1].replace(/"/g,''); // target node
    output[3] = label;
    output[4] = '%20';
    output = output.concat(format('', 'none'));
    fs.appendFile(fileEdges, output.join(sep) + '\n', function (err) {});
  } else {
    // For each property, add 1 line
    for (var i=2; i<items.length-1; i=i+3) {
      var key = items[i].replace(/"/g,''); 
      var val = items[i+2].replace(/"/g,'');
      if (key != 'type') {
        var output = [];
        output[0] = cntEdges; // edge id
        output[1] = items[0].replace(/"/g,''); // source node
        output[2] = items[1].replace(/"/g,''); // target node
        output[3] = label;
        output[4] = key;
        var type = pg.evalType(items[i+2]);
        output = output.concat(format(val, type));
        fs.appendFile(fileEdges, output.join(sep) + '\n', function (err) {});
        if (arrEdgeProp.indexOf(key) == -1) {
          var prop = { name: key, type: type };
          arrEdgeProp.push(key); 
          arrEdgePropType.push(prop); 
        }
      }
    }
  }
}

/*
function flatten(array) {
  return Array.prototype.concat.apply([], array);
}
*/

function createLoadConfig() {
  var config = {
    vertex_uri_list: [ filename(fileNodes) ]
  , edge_uri_list: [ filename(fileEdges) ]
  , format: "flat_file"
  , node_id_type: "string"
  , edge_label: true
  , vertex_props: arrNodePropType
  , edge_props: arrEdgePropType
  , separator: sep
  , loading: {
      load_edge_label:true
    }
  };
  fs.appendFile(fileConfig, JSON.stringify(config, null, 2), function (err) {});
  console.log('"' + fileConfig + '" has been created.');
}

function filename(path) {
  return path.replace(/^.*[\\\/]/, '');
}

function format(str, type) {
  var output = [];
  if (type == 'none') {
    output[0] = '';
    output[1] = '';
    output[2] = '';
    output[3] = '';
  } else if (type == 'string') {
    output[0] = '1';
    output[1] = str;
    output[2] = '';
    output[3] = '';
  } else if (type == 'integer') {
    output[0] = '2';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'float') {
    output[0] = '3';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'double') {
    output[0] = '4';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'datetime') {
    output[0] = '5';
    output[1] = '';
    output[2] = '';
    output[3] = str;
  } else if (type == 'datetime') {
    output[0] = '6';
    output[1] = str;
    output[2] = '';
    output[3] = '';
  }
  return output;
};

