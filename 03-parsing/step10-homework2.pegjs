/* 
  custom MUS language grammar
  ===========================
  supported expressions:
    ; comment
    a4.300 ; note 'a4' with duration 300ms
    _.200  ; rest with duration 200ms
    ( a1.10 b1.10 | c2.20 d2.20 ) ; two sections played in parallel: (a1 then b1) parallel with (c2 then b2)
    { a1.10 b2.10 c3.10 }x5 ; 3-note section repeated 5 times
*/

start =
  ws* e:expr ws* comment?
    { return e; }

ws = // whitespace
  ([ \t] / nl) / (comment nl)
  
nl = // newline
  '\r\n' / [\r\n]
  
comment =
  ';' [^\r\n]*
  
expr =
  seq / par / repeat / atom
  
seq =
  l:(par / repeat / atom) ws+ r:expr
    { return { tag:'seq', left:l, right:r }; }
  
par =
  '(' ws* l:expr ws* '|' ws* r:expr ws* ')'
    { return { tag:'par', left:l, right:r }; }
  
repeat =
  '{'  ws* e:expr ws* '}x' c:number
    { return { tag:'repeat', count:c, section:e }; }

atom =
  note / rest
  
note = 
  p:[a-g]i o:[0-9]+ '.' d:number
    { return { tag:'note', pitch:p.toLowerCase()+o.join(''), dur:d }; }

rest =
  '_.' d:number
    { return { tag:'rest', dur: d }; }

number = 
  d1:[1-9] d2:[0-9]*
    { return d1 + d2.join(''); }