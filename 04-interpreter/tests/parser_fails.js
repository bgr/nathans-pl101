var assert = chai.assert;

suite('parse and interpret throwing errors', function() {
  test('syntax error - extra code', function() {
    assert.throws(function() {
      evalScheemString('4 5',{});
    });
  });
  test('syntax error - open parens', function() {
    assert.throws(function() {
      evalScheemString('(+ 3 4',{});
    });
  });
  test('syntax error - extra parens', function() {
    assert.throws(function() {
      evalScheemString('(+ 3 4))',{});
    });
  });
  test('undefined variable', function() {
    assert.throws(function() {
      evalScheemString('abc',{});
    });
  });
  test('redefine variable', function() {
    assert.throws(function() {
      evalScheemString('(define xx 9)',{xx:8});
    });
  });
  test('(rest of the cases covered in interpreter tests)', function() {});
});