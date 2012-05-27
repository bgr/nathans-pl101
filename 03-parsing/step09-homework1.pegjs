// Scheem language grammar with support for quotes, whitespace and comments

start =
  ws* e:expr ws* comment?
    { return e; }
  
ws = // whitespace
  ([ \t] / nl) / (comment nl)
  
nl = // newline
  '\r\n' / [\r\n]
  
comment =
  ';;' [^\r\n]*

expr =
  atom / exprlist / quotedexpr

quotedexpr =
  "'" e:expr
    { return ['quote',e]; }
  
moreexpr =
  ws+ e:expr
    { return e; }
    
exprlist = 
  ( '(' ws* ')' ) {return []; }  / 
  ( '('  ws*  l:expr+ r:moreexpr* ws* ')' )  { if(r.length > 0) return l.concat(r); else return l; }

atom =
  number / str
  
number =
  s:[-+]? n:[0-9]+
    { return parseInt(s + n.join('')); }
  
str =
  chars:validchar+ 
    { return chars.join(""); }

validchar = 
  [0-9a-zA-Z_?!+\-=@#$%^&*/.<>]
