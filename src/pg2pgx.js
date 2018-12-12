#!/usr/bin/env node

// USAGE: $ node pg2pgx.js <pg_file_path> <output_file_prefix>
// EXAMPLE: $ node pg2pgx.js example/musician.pg output/musician/musician
// OUTPUT_FILES: <prefix>.pgx.nodes <prefix>.pgx.edges <prefix>.json

var fs = require('fs');
var readline = require('readline');
var commander = require('commander');
var pg = require('./pg2.js');

commander
  .version(pg.version)
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
  if (pg.isLineRead(line)) {
    var [id_1, id_2, types, props] = pg.extractItems(line);
    if (id_2 == null) {
      addNodeLine(id_1, props);
    } else {
      addEdgeLine(id_1, id_2, types[0], props);
    }
  }
});

rl.on('close', function() {
  console.log('"' + fileNodes + '" has been created.');
  console.log('"' + fileEdges + '" has been created.');
  createLoadConfig();
});

function addNodeLine(id, props) {
  cntNodes++;
  if (props.length == 0) { // When this node has no property
    var output = [];
    output[0] = id;
    output[1] = '%20'; // %20 means 'no property' in PGX syntax
    output = output.concat(format('', 'none'));
    fs.appendFile(fileNodes, output.join(sep) + '\n', function (err) {});
  } else {
    for (var i=0; i<props.length; i++) { // For each property, add 1 line
      var key = props[i][0]; 
      var val = props[i][1];
      var type = pg.evalType(val);
      var output = [];
      output[0] = id;
      output[1] = key;
      output = output.concat(format(val, type));
      fs.appendFile(fileNodes, output.join(sep) + '\n', function (err) {});
      if (arrNodeProp.indexOf(key) == -1) {
        var propType = { name: key, type: type };
        arrNodeProp.push(key); 
        arrNodePropType.push(propType); 
      }
    }
  }
}

function addEdgeLine(id_1, id_2, label, props) {
  cntEdges++;
  if (props.length == 0) { // When this edge has no property
    var output = [];
    output[0] = cntEdges; // edge id
    output[1] = id_1; // source node
    output[2] = id_2; // target node
    output[3] = label;
    output[4] = '%20'; // %20 means 'no property' in PGX syntax
    output = output.concat(format('', 'none'));
    fs.appendFile(fileEdges, output.join(sep) + '\n', function (err) {});
  } else {
    for (var i=0; i<props.length; i++) { // For each property, add 1 line
      var key = props[i][0]; 
      var val = props[i][1];
      var type = pg.evalType(val);
      var output = [];
      output[0] = cntEdges; // edge id
      output[1] = id_1; // source node
      output[2] = id_2; // target node
      output[3] = label;
      output[4] = key;
      output = output.concat(format(val, type));
      fs.appendFile(fileEdges, output.join(sep) + '\n', function (err) {});
      if (arrEdgeProp.indexOf(key) == -1) {
        var propType = { name: key, type: type };
        arrEdgeProp.push(key); 
        arrEdgePropType.push(propType); 
      }
    }
  }
}

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

