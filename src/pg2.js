var version = '0.2.0'

exports.isLineRead = function (line) {
  if (line.charAt(0) != '#' && line != '') {
    return true;
  } else {
    return false;
  }
}

exports.extractItems = function (line) {
  var regexNode = /^("[^"]+"|\S+)/;
  var regexEdge = /^("[^"]+"|\S+)\s+("[^"]+"|[^:]+)/;
  var id_1, id_2;
  if (!(result = regexEdge.exec(line))) {
    id_1 = regexNode.exec(line)[1];
    id_2 = null;
  } else {
    id_1 = result[1];
    id_2 = result[2];
  }
  var types = globalGroupMatch(line, /\s:(\S+|"[^"]+")/g).map((m) => m[1].replace(/"/g,''));
  var props = globalGroupMatch(line, /\s("[^"]+"|\S+):("[^"]*"|\S*)/g).map((m) => [m[1].replace(/"/g,''), m[2].replace(/"/g,'')]);
  return [id_1, id_2, types, props];
}

exports.checkItems = function (items) {
  console.log('PG: ' + items);
  for(var i=0; i<items.length; i++){
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has unexpected tab(\\t): [' + items[i] + '] after [' + items[i-1] + ']');
    }
  }
}

exports.isProp = function (str) {
  var arr = str.match(/\w+|"[^"]+"/g);
  if (arr.length > 1 && arr[0] != '') {
    return true;
  } else {
    return false;
  }
}

exports.evalType = function (str) {
  if (isDoubleQuoted(str) || isNaN(str)) {
    return 'string';
  } else {
    if (str.match(/\./)) {
      return 'double';
    } else {
      return 'integer';
    }
  }
}

exports.extractTypes = function (line) {
  var types = globalGroupMatch(line, /\s:(\w+|"[^"]+")/g).map((m) => m[1]);
  line = line.replace(/\s:(\w+|"[^"]+")/g, ''); // remove types
  return [line, types];
}

// This method assums to be called after extractTypes
exports.isNodeLine = function (line) {
  var tokens = splitBySpace(line);
  if (tokens.length <= 1) return true;
  var str = tokens[1]; // the second item in the line
  if (isPropertyKV(str)) {
    return true;
  } else {
    return false;
  }
}

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

function isPropertyKV(str) {
  if (str.match(/^".*":".*"$/) || str.match(/^".*":[^"]*$/) || str.match(/^[^"]*:".*"$/) || str.match(/^[^"]*:[^"]*$/)) {
    return true;
  } else {
    return false;
  }
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

