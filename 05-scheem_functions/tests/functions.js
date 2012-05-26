var assert = chai.assert;

suite('let-one', function() {
  var top, middle, deepest;
  var resetEnvs = function() {
    top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
    middle = { bindings: {'y': 16}, outer: top };
    deepest = { bindings: {'x': 2}, outer: middle };
  }
  resetEnvs();
  
  test('simple, blank env', function() {
    var blankEnv = {};
    assert.deepEqual(evalScheemString('(let-one a 5 a)', blankEnv), 5);
    //assert.deepEqual(blankEnv, { bindings: {'a': 5 }, outer: {} } );
  });

  test('simple', function() {
    resetEnvs();
    assert.deepEqual(evalScheemString('(let-one a 5 a)', top), 5);
    assert.deepEqual(top, { bindings: {'a': 5, 'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  
  test('assign evaluated value', function() {
    resetEnvs();
    assert.deepEqual(evalScheemString('(let-one b (+ 3 4) b)', top), 7);
    assert.deepEqual(top, { bindings: {'b': 7, 'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  /*
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
  });*/
});

/*
evalScheem(['let-one', 'x', ['+', 2, 2], 'x'], env3),
    4, 'let-one with computed value');
assert_eq(env3, env3_copy, 'environment did not change');
assert_eq(evalScheem(['let-one', 'z', 7, 'z'], env3),
    7,
    'let-one with environment, inner reference');
assert_eq(evalScheem(['let-one', 'x', 7, 'y'], env3),
    16,
    'let-one with environment, outer reference');*/