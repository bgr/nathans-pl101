// Towers of hanoi with 3 pegs and n discs
// example: to move pegs 1, 2 & 3 from peg A to peg C
//   hanoi(new HanoiMove([1,2,3], 0, 2))

String.prototype.replaceAt = function(index, chr) {
  return this.substr(0, index) + chr + this.substr(index+chr.length);
}

String.prototype.repeat = function(times) {
  return new Array(times+1).join(this);
}

// thunking helpers
var thunk = function(f, a) {
  return { tag:'thunk', func:f, args:a };
}
var thunkValue = function (v) {
    return { tag: "value", val: v };
};

// thunk evaluator
var trampoline = function (thk) {
  while (true) {
    if (thk.tag === "value") {
      return thk.val;
    }
    if (thk.tag === "thunk") {
      thk = thk.func.apply(null, thk.args);
    }
  }
};

// representation of moving the discs
// e.g. move discs 1,2 & 3 from first to third peg: new HanoiMove([1,2,3], 0, 2)
function HanoiMove(discs, src, dest) {
  this.discs = discs;
  this.src = src;
  this.dest = dest;
}

// returns list of moves required to solve the puzzle
var hanoiThunked = function(move, cont) {
  if(!move || move.discs.length == 0) throw new Error('invalid move discs');
  if(move.discs.length == 1) {
    return thunk(cont, [[new HanoiMove(move.discs[0], move.src, move.dest)]]);
  }
  else {
    var thirdPeg = 3 - (move.src + move.dest); // peg that is neither a source peg nor destination peg
    var allButLast = move.discs.slice(0, move.discs.length-1);
    
    var movesBefore = new HanoiMove(allButLast, move.src, thirdPeg);
    var singleMove = new HanoiMove([move.discs[move.discs.length-1]], move.src, move.dest);
    var movesAfter = new HanoiMove(allButLast, thirdPeg, move.dest);
    
    // get before -> get single -> (concat before with single) -> get after -> (concat before & single with after)
    var cont_single_after = function(bef) {
      var cont_after = function(sing) {
        var cont_concat = function(aft) {
          return thunk(cont, [bef.concat(sing).concat(aft)]);
        }
        return thunk(hanoiThunked, [movesAfter, cont_concat]);
      }
      return thunk(hanoiThunked, [singleMove, cont_after]);
    }
    
    return thunk(hanoiThunked, [movesBefore, cont_single_after]);
  }
}


var printPegs = function(pegs, totalDiscs) {
  // horrible code, but it worked on the first try, w00t!
  var bankWidth = totalDiscs*2 + 1;
  var canvas = [];
  // fill blank places
  for (var b=0; b<pegs.length; b++) {
    var bank = [];
    canvas.push(bank);
    for(var l=0; l<totalDiscs+1; l++) {
      var space = (l == totalDiscs) ? "_" : " ";
      var spaces = space.repeat(Math.floor(bankWidth/2));
      var layer = spaces + "|" + spaces;
      bank.push(layer);
    }
  }
  
  // fill discs
  for(var p=0; p<pegs.length; p++) {
    for(var d=0; d<pegs[p].length; d++) {
      var layer = canvas[p].length-(pegs[p].length-d);
      var discStr = "=".repeat((pegs[p][d]-1)*2+1);
      canvas[p][layer] = canvas[p][layer].replaceAt((bankWidth-discStr.length)/2,discStr);
    }
  }
  
  // draw ascii pegs
  var retStr = "";
  for(var l=0; l<canvas[0].length; l++) {
    for (var b=0; b<canvas.length; b++) {
      retStr += canvas[b][l];
    }
    retStr += "\n";
  }
  
  return retStr;
}


// try it out

// out of memory with 25+ elements
var discsToMove = [1,2,3,4,5,/*6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25*/];
var solvedMoves = trampoline(hanoiThunked(new HanoiMove(discsToMove,0,2), thunkValue));
var pegs = [discsToMove.slice(0), [], []];

// draw all the moves
for(var i=0; i<solvedMoves.length; i++) {
  var move = solvedMoves[i];
  pegs[move.dest].unshift( pegs[move.src].shift() );
  var moveDrawing = printPegs(pegs, discsToMove.length);
  console.log(moveDrawing);
}
console.log("Total moves: " + solvedMoves.length);