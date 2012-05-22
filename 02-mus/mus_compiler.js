// Lesson 02: MUS language compiler

// get MIDI pitch from note
var convertPitch = function(p) {
  var l = p.charAt(0).toLowerCase();
  var o = parseInt(p.charAt(1));
  var table = {
    'c': 0,
    'd': 2,
    'e': 4,
    'f': 5,
    'g': 7,
    'a': 9,
    'b': 11
  };
  
  return 12 + 12 * o + table[l];
}

// calculate the ending time of the expression given the starting time
var endTime = function (time, expr) {
    switch(expr.tag) {
        case 'repeat':
            return time + expr.count * endTime(0, expr.section);
        case 'par':
            var endL = endTime(0, expr.left);
            var endR = endTime(0, expr.right);
            return time + ( endL > endR ? endL : endR );
        case 'seq':
            return time + endTime(0, expr.left) + endTime(0, expr.right);
        case 'note':
        case 'rest':
          return parseInt(time) + parseInt(expr.dur);
    }
};

// helper function - compile an expression into raw note
var compileT = function(time, expr) {
    switch(expr.tag) {
        case 'repeat':
            var ret = [];
            var dur = endTime(0, expr.section);
            var nextTime = time;
            for(var i=0; i<expr.count; i++) {
              ret.push(compileT(nextTime, expr.section));
              nextTime += dur;
            }
            return ret;
        case 'par':
            return [compileT(time, expr.left), compileT(time, expr.right)];
        case 'seq':
            return [ compileT(time, expr.left), compileT(endTime(time,expr.left), expr.right) ];
        case 'note':
            return {tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur };
        case 'rest':
            return {tag: 'rest', start: time, dur: expr.dur };
    }
};


// helper function - flatten the compiled note array
var flatten = function(compiled) {
  if(Array.isArray(compiled)) {
    var ret = [];
    for(var k in compiled) {
      var fl = flatten(compiled[k]);
      if(Array.isArray(fl))
        for(var j in fl) ret.push(fl[j]);
      else ret.push(fl);
    }
    return ret;
  }
  else {
    return compiled;
  }
}

// compile a MUS expression into raw notes
var compile = function (musexpr) {
  return flatten(compileT(0,musexpr));
};




// try it out

var melody_mus = 
  { tag: 'seq',
    left: { 
      tag: 'seq',
      left: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 220 },      // s: 0
        right: { tag: 'rest', dur: 300 } },                // s: 220
      right: { 
        tag: 'par',
        left: { 
          tag: 'repeat',
          count: 3,
          section: {
            tag: 'seq',
            left: { 
              tag: 'par',
              left: { tag:'note', pitch: 'e4', dur: 80 },  //   s: 520,   800,   1080
              right:{ tag:'rest', dur: 30 } },             //   s: 520,   800,   1080
            right: { tag:'note', pitch: 'a4', dur: 200 }   //     s: 600,   880,   1160
          }                                                     
        },                                                      
        right: {                                                
          tag: 'seq',                                           
          left: { tag: 'note', pitch: 'c6', dur: 480 },    //   s: 520
          right: { tag: 'note', pitch: 'd6', dur: 10 }     //     s: 1000
        }                                                       
      }                                                         
    },                                                          
    right: {                                                    
      tag: 'seq',                                               
      left: { tag: 'note', pitch: 'c0', dur: 10 },         //                       s: 1360
      right: { tag: 'note', pitch: 'b0', dur: 15 }         //                         s: 1370
    }
  };
  


console.log("MUS:");
console.log(melody_mus);
console.log();
console.log("Compiled:");
console.log(compile(melody_mus));