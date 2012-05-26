var assert = chai.assert;

suite('let-one', function() {
  var top, middle, deepest;
  top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
  middle = { bindings: {'y': 16}, outer: top };
  deepest = { bindings: {'x': 2}, outer: middle };
  
  test('simple, blank env', function() {
    var blankEnv = {};
    assert.deepEqual(evalScheemString('(let-one a 5 a)', blankEnv), 5);
    assert.deepEqual(blankEnv, { bindings: {}, outer: {} } );
  });

  test('existing env, make sure it\'s unchanged', function() {
    assert.deepEqual(evalScheemString('(let-one abc 5 abc)', top), 5);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  
  test('assign evaluated value', function() {
    assert.deepEqual(evalScheemString('(let-one seven (+ 3 4) seven)', top), 7);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
  test('bind from middle, then evaluate in deepest with outer references', function() {
    assert.deepEqual(evalScheemString('(let-one x (+ 3 4) x)', middle), 7);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
    
    assert.deepEqual(evalScheemString('(let-one z (+ y abc) ;; z=72 \n (+ x z))', deepest), 74);
    assert.deepEqual(top, { bindings: {'x': 19, 'abc': 56}, outer: { } });
    assert.deepEqual(middle, { bindings: {'y': 16}, outer: top });
    assert.deepEqual(deepest, { bindings: {'x': 2}, outer: middle });
  });
});