var assert = chai.assert;
var evalScheemString = EvalScheem.parseAndEval;
var InterpreterError = EvalScheem.InterpreterError;

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


suite('lambda-one', function() {
  var top, middle, deepest;
  top = { bindings: {'x': 19, 'abc': 56}, outer: { } };
  middle = { bindings: {'y': 16}, outer: top };
  deepest = { bindings: {'x': 2}, outer: middle };
  
  test('simple lambda', function() {
    assert.deepEqual(evalScheemString('((lambda-one x x) 5)', {}), 5);
  });
  test('lambda +1', function() {
    assert.deepEqual(evalScheemString('((lambda-one x (+ 1 x)) 5)', {}), 6);
  });
  test('nested lambdas, external var reference', function() {
    assert.deepEqual(evalScheemString('(((lambda-one x (lambda-one y (+ x y))) 5) 3)', {}), 8);
  });
  test('nested lambdas, local var shadows external var with same name', function() {
    assert.deepEqual(evalScheemString('(((lambda-one x (lambda-one x (+ x x))) 5) 3)', {}), 6);
  });
});


suite('let', function() {
  test('one arg', function() {
    assert.deepEqual(evalScheemString('(let ((a 5)) a)', {}), 5);
  });
  test('two args', function() {
    assert.deepEqual(evalScheemString('(let ((abc 5) (d 6)) (+ d abc))', {}), 11);
  });
  test('expressions evaluate as args', function() {
    assert.deepEqual(evalScheemString('(let ((abc (+ 5 x)) (d (* 2 x))) (+ (* 3 d) abc))', {bindings: {x: 3}, outer: {}}), 26);
  });
  
  test('fail, params not in pairs', function() {
    assert.throws(function() {
      evalScheemString('(let (abc 5) (+ 1 abc))', {});
    }, InterpreterError);
  });
  test('fail, params not a list', function() {
    assert.throws(function() {
      evalScheemString('(let abc (+ 1 abc))', {});
    }, InterpreterError);
  });
  test('fail, no body to eval', function() {
    assert.throws(function() {
      evalScheemString('(let ((abc 5)) )', {});
    }, InterpreterError);
  });
  test('fail, extra params in var declarations', function() {
    assert.throws(function() {
      evalScheemString('(let ((abc 5 6) (d 6)) (+ d abc))', {});
    }, InterpreterError);
  });
  test('fail, missing params in var declarations', function() {
    assert.throws(function() {
      evalScheemString('(let ((abc 5) (d)) (+ d abc))', {});
    }, InterpreterError);
  });
  test('fail, atom in var declarations', function() {
    assert.throws(function() {
      evalScheemString('(let ((abc 5) d) (+ d abc))', {});
    }, InterpreterError);
  });
});


suite('lambda', function() {
  test('no args', function() {
    assert.deepEqual(evalScheemString('((lambda () 5))', {}), 5);
  });
  test('no args, evaluated body', function() {
    assert.deepEqual(evalScheemString('((lambda () (* (- 5 a) 4)))', { bindings: { a:2 }, outer: {} }), 12);
  });
  test('one arg "a"', function() {
    assert.deepEqual(evalScheemString('((lambda a a) 5)', {}), 5);
  });
  test('one arg "abcd"', function() {
    assert.deepEqual(evalScheemString('((lambda abcd abcd) 5)', {}), 5);
  });
  test('one arg "a" in parens', function() {
    assert.deepEqual(evalScheemString('((lambda (a) a) 5)', {}), 5);
  });
  test('one arg "abcd" in parens', function() {
    assert.deepEqual(evalScheemString('((lambda (abcd) abcd) 5)', {}), 5);
  });
  test('two args, evaluated body', function() {
    assert.deepEqual(evalScheemString('((lambda (a bcd) (+ bcd a)) 5 4)', {}), 9);
  });
  test('three args, evaluated body', function() {
    assert.deepEqual(evalScheemString('((lambda (a bcd ef) (+ bcd (* a ef))) 5 4 3)', {}), 19);
  });
  
  test('fail, no body', function() {
    assert.throws(function() {
      evalScheemString('(lambda (a b) )', {});
    }, InterpreterError);
  });

});

