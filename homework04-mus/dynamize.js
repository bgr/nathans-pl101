var ParseResult = function(message, isError, ast, raw) {
  this.message = message;
  this.isError = isError;
  this.ast = ast;
  this.raw = raw;
}

var parse = function(code) {
  // parse string
  try {
    var parsed = MUS.parse(code);
  }
  catch(err) { // syntax error
    return new ParseResult('Syntax error at line:' + err.line + ', col:' + err.column + ' - ' + err.message, true, {}, []);
  }
  
  var raw = compile(parsed);
  
  return new ParseResult("Compilation OK", false, parsed, raw);
}


function drawNotes(id, notes) {
  if(!Array.isArray(notes)) {
    if(notes.tag == 'note') notes = [notes]; // input is valid but is just one note
    else throw new Error('invalid input');
  }
  var pjs = Processing.getInstanceById(id);
  
  // clear existing notes
  pjs.clear();
  
  // send notes to pjs one by one
  var n;
  for(var i=0; i<notes.length; i++) {
    note=notes[i];
    var pitch,start,end;
    pitch = (note.tag == 'note') ? parseInt(note.pitch) : -1;
    start = parseInt(note.start);
    end = parseInt(note.start) + parseInt(note.dur);
    pjs.addNote(pitch, start, end);
  }
  
  // draw the sent notes
  pjs.redrawNotes();
}



$(function() { // on DOM ready

  var timer;
  
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    onChange: function(e) {
      clearTimeout(timer);
      timer = setTimeout(doParse, 500);
    }
  });
  
  var resPane = $('#resultpane');
  var musPane = $('#muspane');
  var notePane = $('#notepane');

  var doParse = function(scheemCode) {
    var res = parse(editor.getValue());
    if(res.isError) {
      if(resPane.hasClass('parser-ok')) resPane.removeClass('parser-ok');
      if(!resPane.hasClass('parser-error')) resPane.addClass('parser-error');
      resPane.text(res.message);
      musPane.text(' ');
      notePane.text(' ');
    }
    else {
      if(resPane.hasClass('parser-error')) resPane.removeClass('parser-error');
      if(!resPane.hasClass('parser-ok')) resPane.addClass('parser-ok');
      resPane.text(res.message);
      musPane.text(JSON.stringify(res.ast, null, " "));
      notePane.text(JSON.stringify(res.raw, null, " "));
      drawNotes('notevis', res.raw);
    }
  }
  
  $('.codebutton').click(function() {
    var scheemCode = $(this).data('mus').toString().replace(/(\\n)/g,'\n');
    editor.setValue(scheemCode);
    doParse();
  });
  
  
  // set up resizing for canvas
  
  var resizeCanvas = function() {
    var w = $('#notevis-container').width();
    var h = $('#notevis-container').height();
    //console.log("resize canvas to " + w + " x " + h);
    var pjs = Processing.getInstanceById('notevis');
    pjs.size(w,h);
    pjs.redrawNotes();
  }
  var rt; // timer variable
  var tryResize = function() {
    if(Processing.getInstanceById('notevis')) { 
      resizeCanvas(); 
      rt=null;
    }
    else rt = setTimeout(tryResize,250);
  }
  tryResize();
  
  $(window).resize(function() {
    if(rt) return; // resize already pending
    else rt = setTimeout(tryResize,250);
  });

}); // end on DOM ready