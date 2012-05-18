start =
  ws* e:expr ws*
    { return e; }
    
ws = // whitespace
  [ \t\r\n]

expr =
  r:(atom / exprlist)
    { return r; }
  
spacedexpr =
  ws+ e:expr
    { return e; }
    
exprlist = 
	'(' ws* l:expr r:spacedexpr*  ws* ')'
    { if(r.length > 0) return [l].concat(r); else return [l]; }

atom =
  chars:validchar+ 
    { return chars.join(""); }
        
validchar = 
  [0-9a-zA-Z_?!+\-=@#$%^&*/.]
