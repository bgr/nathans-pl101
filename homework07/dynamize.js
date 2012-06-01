
$(function() { // on DOM ready

  var timer;
  var solveBtn = $('#solvebtn');
  var stopBtn = $('#stopbtn');
  var canvasPane = $('#hanoicanvas');
  var numDiscs = $('#numdiscs');
  var numTimeout = $('#numtimeout');
  
  var stopDrawing = function() {
    if(timer) {
      clearInterval(timer);
      timer = null;
      stopBtn.hide();
    }
  }
  
  stopBtn.click(stopDrawing);
  stopBtn.hide();

  solveBtn.click(function() {
    stopDrawing();
    stopBtn.show();
    var d = parseInt(numDiscs.val());
    if(isNaN(d) || d < 1) {
      d = 6;
      numDiscs.val(d);
    }
    
    var pegsToMove = [];
    for(var i=1; i<=d; i++) pegsToMove.push(i);
    
    canvasPane.text('Solving');
    canvasPane.attr('rows', pegsToMove.length+6);
    
    var solvedMoves = hanoi(new HanoiMove(pegsToMove,0,2));
    var pegs = [pegsToMove.slice(0), [], []];
    
    // animate moves
    var timeout = parseInt(numTimeout.val());
    console.log(timeout);
    if(isNaN(timeout) || timeout < 1) {
      timeout = 100;
      numTimeout.val(timeout);
    }
    
    var i=0;
    timer = setInterval(function() {
      if(i==solvedMoves.length) {
        stopDrawing();
        return;
      }
      var move = solvedMoves[i];
      pegs[move.dest].unshift( pegs[move.src].shift() );
      var moveDrawing = printPegs(pegs, pegsToMove.length);
      var progressBar = "";
      var percent = (i+1)/solvedMoves.length;
      for(var j=0; j<40; j++) {
        progressBar += (j/40 < percent) ? "*" : " ";
      }
      progressBar = "[" + progressBar + "] " + Math.round(percent*100) + "%  (" + (i+1) + "/" + solvedMoves.length + ")";
      canvasPane.text("\n" + moveDrawing + "\n\n" + progressBar);
      i++;
    }, timeout);
    
  });

}); // end on DOM ready