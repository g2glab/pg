{
  let nodeCount = 0;
  let edgeCount = 0;
  let nodeLabelHash = {};
  let edgeLabelHash = {};
  let nodePropHash = {};
  let edgePropHash = {};
}

PG = lines:NodeOrEdge+
{
  return {
    nodes: lines.map(l => l.node).filter(v => v),
    edges: lines.map(l => l.edge).filter(v => v),
    nodeCount: nodeCount,
    edgeCount: edgeCount,
    nodeLabels: nodeLabelHash,
    edgeLabels: edgeLabelHash,
    nodeProperties: nodePropHash,
    edgeProperties: edgePropHash
    // nodeProperties: Object.keys(nodePropHash),
    // edgeProperties: Object.keys(edgePropHash)
  }
}

NodeOrEdge = n:Node
{
  return {
    node: n
  }
}
/ e:Edge
{
  return {
    edge: e
  }
}

Node = COMMENT_LINE* WS* id:Value l:Label* p:Property* INLINE_COMMENT? ENDOFLINE COMMENT_LINE*
{
  let propObj = {};
  p.forEach(prop => {
    if (propObj[prop.key]) {
      propObj[prop.key].push(prop.value);
    } else {
      propObj[prop.key] = [prop.value];
    }
    // nodePropHash[prop.key] = true;
    if (nodePropHash[prop.key]) {
      nodePropHash[prop.key]++;
    } else {
      nodePropHash[prop.key] = 1;
    }
  });

  nodeCount++;

  l.forEach(label => {
    if (nodeLabelHash[label]) {
      nodeLabelHash[label]++;
    } else {
      nodeLabelHash[label] = 1;
    }
  });

  return {
    id: id,
    labels: l,
    properties: propObj
  }
}

Edge = COMMENT_LINE* WS* f:Value WS+ d:Direction WS+ t:Value l:Label* p:Property* INLINE_COMMENT? ENDOFLINE COMMENT_LINE*
{
  let propObj = {};
  p.forEach(prop => {
    if (propObj[prop.key]) {
      propObj[prop.key].push(prop.value);
    } else {
      propObj[prop.key] = [prop.value];
    }
    // edgePropHash[prop.key] = true;
    if (edgePropHash[prop.key]) {
      edgePropHash[prop.key]++;
    } else {
      edgePropHash[prop.key] = 1;
    }
  });

  edgeCount++;

  l.forEach(label => {
    if (edgeLabelHash[label]) {
      edgeLabelHash[label]++;
    } else {
      edgeLabelHash[label] = 1;
    }
  });

  return {
    from: f,
    to: t,
    direction: d,
    labels: l,
    properties: propObj
  }
}

Label = WS+ ':' WS* l:Value
{
  return l
}

Property = WS+ k:Value WS* ':' WS* v:Value
{
  return {
    key: k,
    value: v
  }
}

Direction = '--' / '->'

Value = 
// Number
// {
//   return text();
// }
'"' chars:DoubleStringCharacter* '"'
{
  return chars.join('');
}
/ "'" chars:SingleStringCharacter* "'"
{
  return chars.join('');
}
/ chars:BARE_CHAR+
{
  return chars.join('');
}

// Number = '-'? Integer ('.' [0-9]+)? Exp?

// Integer = '0' / [1-9] [0-9]*

// Exp = [eE] ('-' / '+')? [0-9]+

DoubleStringCharacter = !('"' / "\\") char:.
{
  return char;
}
/ "\\" sequence:EscapeSequence
{
  return sequence;
}

SingleStringCharacter = !("'" / "\\") char:.
{
  return char;
}
/ "\\" sequence:EscapeSequence
{
  return sequence;
}

EscapeSequence = "'" / '"' / "\\"
/ "b"  { return "\b";   }
/ "f"  { return "\f";   }
/ "n"  { return "\n";   }
/ "r"  { return "\r";   }
/ "t"  { return "\t";   }
/ "v"  { return "\x0B"; }

BARE_CHAR = [^:\u0020\u0009\u000D\u000A]

// space or tab
WS = [\u0020\u0009]


ENDOFLINE = !. / [\u000D\u000A]

// CR or LF
NEWLINE = [\u000D\u000A]

NON_NEWLINE = [^\u000D\u000A]

COMMENT_LINE = WS* ('#' NON_NEWLINE*)? NEWLINE
{
    return;
}

INLINE_COMMENT = WS+ '#' WS+ NON_NEWLINE*
