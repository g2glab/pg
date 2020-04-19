let commander = require('commander');
let path = require('path');
let fs = require('fs');

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
  let regexNode = /^("[^"]+"|[^"\s]+)/;
  let regexEdge = /^("[^"]+"|[^"\s]+)\s+(->|--)\s+("[^"]+"|[^"\s]+)/;
  let id1, id2, undirected;
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
  // LABELS
  let labels = new Set();
  let regexLabels = /\s:("[^"]+"|[^:"\u0020\u0009]+)/g;
  while (result = regexLabels.exec(line)) {
    labels.add(result[1].rmdq());
  }
  // PROPERTIES
  let properties = new Map();
  let regexProperties = /\s("[^"]+"|[^"\s]+):("[^"]*"|[^"\s]*)/g;
  while (result = regexProperties.exec(line)) {
    let key = result[1].rmdq();
    let value = result[2];
    if (!(properties.has(key))) {
      let values = new Set();
      values.add(value);
      properties.set(key, values);
    } else {
      let values = properties.get(key).add(value);
      properties.set(key, values);
    } 
  }
  return [id1, id2, undirected, Array.from(labels), properties];
}

exports.checkItems = function (items) {
  for(let i = 0; i < items.length; i++){
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
      return 'int';
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

