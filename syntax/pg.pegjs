PG = lines:NodeOrEdge+
{
  return lines
}

NodeOrEdge = COMMENT_LINE* line:( Node / Edge ) COMMENT_LINE*
{
  return line;
}

Node = WS* id:Value l:Label* p:Property* INLINE_COMMENT? NEWLINE
{
  return {
    id: id,
    labels: l,
    properties: p
  }
}

Edge = WS* f:Value WS+ d:Direction WS+ t:Value l:Label* p:Property* INLINE_COMMENT? NEWLINE
{
  return {
    from: f,
    to: t,
    labels: l,
    direction: d,
    properties: p
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

Number = '-'? Integer ('.' [0-9]+)? Exp?

Integer = '0' / [1-9] [0-9]*

Exp = [eE] ('-' / '+')? [0-9]+

Value = 
Number
{
  return text();
}
/'"' chars:DoubleStringCharacter* '"'
{
  return chars.join('');
}
/ "'" chars:SingleStringCharacter* "'"
{
  return chars.join('');
}
/ chars:CHARACTER+
{
  return chars.join('');
}

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

EscapeSequence
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }
  / "v"  { return "\x0B"; }

// space or tab
WS = [\u0020\u0009]

// CR or LF
NEWLINE = [\u000D\u000A]
NON_NEWLINE = [^\u000D\u000A]

COMMENT_LINE = WS* ('#' NON_NEWLINE*)? NEWLINE
{
    return;
}

INLINE_COMMENT = WS+ '#' WS+ NON_NEWLINE*

CHARACTER = [^:\u0020\u0009\u000D\u000A]

Direction = '--' / '->'
