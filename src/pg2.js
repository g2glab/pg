var version = '0.2.1'
var commander = require('commander');

exports.commander = commander
  .version(version)
  .arguments('<pg_file_path> <output_file_prefix>')
  .action(function (pg_file_path, output_file_prefix) {
    pathPg = pg_file_path;
    prefix = output_file_prefix;
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
  var regexNode = /^("[^"]+"|\S+)/;
  var regexEdge = /^("[^"]+"|\S+)\s+("[^"]+"|[^:]+)(\s|$)/;
  var id1, id2;
  if (!(result = regexEdge.exec(line))) {
    strId1 = regexNode.exec(line)[1];
    id1 = [strId1.rmdq(), strId1.type()];
    id2 = null;
    line = line.replace(/^("[^"]+"|\S+)/, '');
  } else {
    id1 = [result[1].rmdq(), result[1].type()];
    id2 = [result[2].rmdq(), result[2].type()];
    line = line.replace(/^("[^"]+"|\S+)\s+("[^"]+"|\S+)/, '');
  }
  var labels = globalGroupMatch(line, /\s:(\S+|"[^"]+")/g).map((m) => m[1].rmdq());
  var props = globalGroupMatch(line, /\s("[^"]+"|\S+):("[^"]*"|\S*)/g).map((m) => [m[1].rmdq(), m[2].rmdq(), m[2].type()]);
  return [id1, id2, labels, props];
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
