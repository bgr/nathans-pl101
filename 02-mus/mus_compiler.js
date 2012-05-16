var endTime = function (time, expr) {
    switch(expr.tag) {
        case 'seq':
            return time + endTime(0, expr.left) + endTime(0, expr.right);
        case 'note':
            return time + expr.dur;
    }
};


var compileT = function(time, expr) {
    switch(expr.tag) {
        case 'seq':
            return [compileT(time,expr.left),compileT(endTime(time,expr.right),expr.right)];
        case 'note':
            return {tag: 'note', pitch: expr.pitch, start: time, dur: expr.dur };
        default:
            log("Error");
    }
};


var compile = function (musexpr) {
    switch(musexpr.tag) {
        case 'seq':
            var left = compileT(0, musexpr.left);
            var l = left[left.length-1];
            var right = compileT(l.start+l.dur, musexpr.right);
            return left.concat(right);
        case 'note':
            var ret = compileT(0,musexpr);
            log(ret);
            return [ret];
    }
};


var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log("MUS:");
console.log(melody_mus);
console.log("Compiled:");
console.log(compile(melody_mus));