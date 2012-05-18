start =
  expr

expr =
	atom / exprlist
  
spacedexpr =
  ' ' e:expr
    { return e; }
    
exprlist = 
	'(' l:expr r:spacedexpr* ')'
    { if(r.length > 0) return [l].concat(r); else return [l]; }

atom =
  chars:validchar+
    { return chars.join(""); }
        
validchar = 
  [0-9a-zA-Z_?!+\-=@#$%^&*/.]

