var assert = chai.assert;
var lookup = EvalScheem.lookup;
var update = EvalScheem.update;
var bind = EvalScheem.bind;
var InterpreterError = EvalScheem.InterpreterError;

suite('lookup a variable in environment', function() {
  var top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
  var middle = { bindings: {'y': 16}, outer: top };
  var deepest = { bindings: {'x': 2}, outer: middle };

  test('find "x" in top', function() {
    assert.deepEqual(lookup('x',top), 19);
  });
  test('find "abc" in top', function() {
    assert.deepEqual(lookup('abc',top), 56);
  });
  test('find "x" in one above from middle', function() {
    assert.deepEqual(lookup('x',middle), 19);
  });
  test('find "abc" in one above from middle', function() {
    assert.deepEqual(lookup('abc',middle), 56);
  });
  test('find "abc" in two above', function() {
    assert.deepEqual(lookup('abc',deepest), 56);
  });
  test('find "x" in one deepest', function() {
    assert.deepEqual(lookup('x',deepest), 2);
  });
  
  test('fail a lookup, no variable', function() {
    assert.throws(function() { 
      lookup('abcd',top); }, 
      InterpreterError);
  });
  test('fail a lookup, badly defined environment without bindings', function() {
    assert.throws(function() { 
      lookup('abcd', {}); }, 
      InterpreterError);
  });
  test('fail a lookup, badly defined environment without outer', function() {
    assert.throws(function() { 
      lookup('abcd', {bindings: {} }); }, 
      InterpreterError);
  });
});


suite('update a variable in environment', function() {
  var top, middle, deepest;
  var resetEnvs = function() {
    top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
    middle = { bindings: {'y': 16}, outer: top };
    deepest = { bindings: {'x': 2}, outer: middle };
  }
  resetEnvs();

  test('update "x" in top', function() {
    resetEnvs();
    update('x',23,top);
    assert.deepEqual(top, { bindings: {'x': 23, 'abc': 56}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('update "abc" in top', function() {
    resetEnvs();
    update('abc',78,top);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 78}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('update "x" in one above from middle, middle unchanged', function() {
    resetEnvs();
    update('x', 17, middle);
    assert.deepEqual(top, { bindings: {'x': 17, 'abc': 56}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('update "abc" in one above from middle', function() {
    resetEnvs();
    update('abc', 90, middle);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 90}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('update "abc" in two above, middle and deepest unchanged', function() {
    resetEnvs();
    update('abc', 123, middle);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 123}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('update "x" in deepest, middle and top unchanged', function() {
    resetEnvs();
    update('x', 7, deepest);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 7}, outer: middle });
  });
  
  resetEnvs();
  
  test('fail an update, no variable', function() {
    assert.throws(function() { 
      update('abcd',3,top); }, 
      InterpreterError);
  });
  test('fail an update, badly defined environment without bindings', function() {
    assert.throws(function() { 
      update('abcd', 3, {}); }, 
      InterpreterError);
  });
  test('fail an update, badly defined environment without outer', function() {
    assert.throws(function() { 
      update('abcd', 3, {bindings: {}}); }, 
      InterpreterError);
  });
});


suite('add new variable binding', function() {
  var top, middle, deepest;
  var resetEnvs = function() {
    top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
    middle = { bindings: {'y': 16}, outer: top };
    deepest = { bindings: {'x': 2}, outer: middle };
  }
  resetEnvs();

  test('bind "y" to new local environment, old environments don\'t change', function() {
    resetEnvs();
    var newEnv = bind('y',23,top);
    assert.deepEqual(newEnv, { bindings: { 'y': 23 }, outer: top } );
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('bind "abcd" to new local environment, old environments don\'t change', function() {
    resetEnvs();
    var newEnv = bind('abcd',23,middle);
    assert.deepEqual(newEnv, { bindings: { 'abcd': 23 }, outer: middle } );
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } } );
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  
});

