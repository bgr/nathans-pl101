var ParseResult = function(message, isError, env) {
  this.message = message;
  this.isError = isError;
  this.env = env;
}

var parse = function(code) {
  // parse string
  try {
    var parsed = SCHEEM.parse(code);
  }
  catch(err) { // syntax error
    return new ParseResult('Syntax error at line:' + err.line + ', col:' + err.column + ' - ' + err.message, true, {});
  }
  
  var evald, env = {};
  // syntax ok, interpret
  try {
    evald = evalScheem(parsed, env);
  }
  catch(err) { // interpreter error
    return new ParseResult('Interpreting error - ' + err.message, true, {});
  }
  
  // interpreting ok
  if(Array.isArray(evald)) evald = JSON.stringify(evald);
  return new ParseResult(evald + "", false, env);
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
  var envPane = $('#environment');

  var doParse = function(scheemCode) {
    var res = parse(editor.getValue());
    if(res.isError) {
      if(resPane.hasClass('parser-ok')) resPane.removeClass('parser-ok');
      if(!resPane.hasClass('parser-error')) resPane.addClass('parser-error');
      resPane.text(res.message);
      envPane.text('clear out the errors first');
    }
    else {
      if(resPane.hasClass('parser-error')) resPane.removeClass('parser-error');
      if(!resPane.hasClass('parser-ok')) resPane.addClass('parser-ok');
      resPane.text(res.message);
      envPane.text(JSON.stringify(res.env));
    }
  }

  $('.codebutton').click(function() {
    var scheemCode = $(this).data('scheem').toString().replace(/(\\n)/g,'\n');
    editor.setValue(scheemCode);
    doParse();
  });

}); // end on DOM ready