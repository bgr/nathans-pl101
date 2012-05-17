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
        case 'par':
            var endL = endTime(0, expr.left);
            var endR = endTime(0, expr.right);
            return time + ( endL > endR ? endL : endR );
        case 'seq':
            return time + endTime(0, expr.left) + endTime(0, expr.right);
        case 'note':
        case 'rest':
          return time + expr.dur;
    }
};

// helper function - compile an expression into raw note
var compileT = function(time, expr) {
    switch(expr.tag) {
        case 'par':
            var l = compileT(time, expr.left);
            var r = compileT(time, expr.right);
            //if(Array.isArray(l)) l = 
            return [l, r];
        case 'seq':
            return [ compileT(time, expr.left), compileT(endTime(time,expr.left), expr.right) ];
        case 'note':
            return {tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur };
        case 'rest':
            return {tag: 'rest', start: time, dur: expr.dur };
    }
};

// compile a MUS expression into raw notes
var compile = function (musexpr) {
    switch(musexpr.tag) {
        case 'par':
            var l1 = compileT(0, musexpr.left);
            var r1 = compileT(0, musexpr.right);
            return l1.concat(r1);
        case 'seq':
            var left = compileT(0, musexpr.left);
            var l = left[left.length-1];
            var right = compileT(l.start+l.dur, musexpr.right);
            return left.concat(right);
        case 'note':
        case 'rest':
            var ret = compileT(0,musexpr);
            return [ ret ];
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


// try it out

var melody_mus = 
    { tag: 'seq',
      left: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 220 },
        right: { tag: 'rest', dur: 300 } },
      right: { 
        tag: 'par',
        left: {
          tag: 'seq',
          left: { tag: 'note', pitch: 'c4', dur: 480 },
          right: { tag: 'note', pitch: 'd4', dur: 500 } },
        right: { 
          tag: 'seq',
          left: { 
            tag: 'par',
            left: { tag:'note', pitch: 'e4', dur: 80 },
            right:{ tag:'rest', dur: 30 } },
          right: { tag:'note', pitch: 'a4', dur: 200 }
        }
      }
    };


console.log("MUS:");
console.log(melody_mus);
console.log("Compiled:");
console.log(flatten(compile(melody_mus)));