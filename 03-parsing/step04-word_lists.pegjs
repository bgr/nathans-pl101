start =
    wordlist
    
word = 
	w:[a-z]+
    { return w.join(""); }
    
spacedword =
	' ' w:word
    { return w; }

wordlist = 
	l:word r:spacedword*
    { if(r.length > 0) return [l].concat(r); else return [l]; }