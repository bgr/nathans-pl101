var assert = chai.assert;

suite('parser syntax errors', function() {
  test('extra code', function() {
    assert.throws(function() {
      evalScheemString('4 5',{});
    }, SCHEEM.SyntaxError.prototype);
  });
  test('open parens', function() {
    assert.throws(function() {
      evalScheemString('(+ 3 4',{});
    }, SCHEEM.SyntaxError.prototype);
  });
  test('extra parens', function() {
    assert.throws(function() {
      evalScheemString('(+ 3 4))',{});
    }, SCHEEM.SyntaxError.prototype);
  });
  test('(more extensive testing was done in parser tests in previous project)', function() {});
});

suite('interpreter errors', function() {
  test('undefined variable', function() {
    assert.throws(function() {
      evalScheemString('abc',{});
    }, InterpreterError);
  });
  test('redefine variable', function() {
    assert.throws(function() {
      evalScheemString('(define xx 9)',{xx:8});
    }, InterpreterError);
  });
  test('invalid function', function() {
    assert.throws(function() {
      evalScheemString('(asd 1 2)',{});
    }, InterpreterError);
  });
  test('invalid function', function() {
    assert.throws(function() {
      evalScheemString('(12 15 2)',{});
    }, InterpreterError);
  });
  test('(rest of the cases covered in interpreter tests)', function() {});
});