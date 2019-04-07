var commander = require('commander');
var path = require('path');
var fs = require('fs');

exports.commander = commander
  .version(require("../package.json").version)
  .option('-o, --output_dir [dir]', 'directory path for results', './')
  .arguments('<pg_file_path>')
  .action(function (pg_file_path) {
    pathPg = pg_file_path;
    basenamePg = path.basename(pg_file_path, '.pg');
    prefix = path.join(commander.output_dir, basenamePg);
    if (!fs.existsSync(commander.output_dir)) {
      fs.mkdirSync(commander.output_dir, {recursive: true});
    }
  })
  .parse(process.argv);

exports.isLineRead = function (line) {
  if (line.charAt(0) != '#' && line != '') {
    return true;
  } else {
    return false;
  }
}

exports.extractItems = function (line) {
  var regexNode = /^("[^"]+"|[^"\s]+)/;
  var regexEdge = /^("[^"]+"|[^"\s]+)\s+(->|--)\s+("[^"]+"|[^"\s]+)/;
  var id1, id2, undirected;
  if (!(result = regexEdge.exec(line))) {
    if (!(result = regexNode.exec(line))) {
      console.log('ERROR - this line is neither node nor edge: ' + line);
    } else {
      id1 = [result[1].rmdq(), result[1].type()];
      id2 = null;
      undirected = null;
    }
  } else {
    id1 = [result[1].rmdq(), result[1].type()];
    id2 = [result[3].rmdq(), result[3].type()];
    undirected = (result[2] == '->') ? false : true ;
  }
  var labels = globalGroupMatch(line, /\s:("[^"]+"|[^"\s]+)/g).map((m) => m[1].rmdq());
  var props = {};
  globalGroupMatch(line, /\s("[^"]+"|[^"\s]+):("[^"]*"|[^"\s]*)/g).forEach(function(m) {
    props[m[1].rmdq()] = m[2];
  });
  return [id1, id2, undirected, labels, props];
}

exports.checkItems = function (items) {
  console.log('PG: ' + items);
  for(var i=0; i<items.length; i++){
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has unexpected tab(\\t): [' + items[i] + '] after [' + items[i-1] + ']');
    }
  }
}

String.prototype.type = function () {
  if (isDoubleQuoted(this) || isNaN(this)) {
    return 'string';
  } else {
    if (this.match(/\./)) {
      return 'double';
    } else {
      return 'integer';
    }
  }
}

String.prototype.dq = function () { // Remove double quotes
  return '"' + this + '"';
}

String.prototype.rmdq = function () { // Remove double quotes
  return this.replace(/^"(.+)"$/, '$1');
}

function isDoubleQuoted(str) {
  if (str.startsWith('"') && str.endsWith('"') && (str.match(/"/g) || []).length == 2) {
    return true;
  } else {
    return false;
  }
}

function globalGroupMatch(text, pattern) {
  var matchedArray = [];
  var regex = pattern;
  while(match = regex.exec(text)) {
    matchedArray.push(match);
  }
  return matchedArray;
}

// NOT USED. TO BE REMOVED.
exports.extractTypes = function (line) {
  var types = globalGroupMatch(line, /\s:(\w+|"[^"]+")/g).map((m) => m[1]);
  line = line.replace(/\s:(\w+|"[^"]+")/g, ''); // remove types
  return [line, types];
}

// NOT USED. TO BE REMOVED.
function splitBySpace(str) {
  var inQuote = false;
  var afterQuote = false;
  var tokens = [];
  var token = '';
  for (var i = 0; i < str.length; i++) {
    var c = str[i];
    if(afterQuote && c === '"') {
      tokens[tokens.length - 1] += '"';
      afterQuote = false;
      continue;
    }
    afterQuote = false;
    if(c === '"'){
      inQuote = !inQuote;
      afterQuote = true;
    }
    if(!inQuote && c.match(/\s/)){
      if(token != '') tokens.push(token);
      token = '';
    }else{
      token += c;
    }
  }
  if(token != '') tokens.push(token);
  return tokens;
}
