var assert = chai.assert;
var evalScheem = EvalScheem.eval;

suite('atoms', function() {
  test('number', function() {
    assert.deepEqual(
      evalScheem(5,{}),
      5
    );
  });
  test('variable', function() {
    assert.deepEqual(
      evalScheem('abc',{ bindings: {abc:7} }),
      7
    );
  });
});

suite('quote', function() {
  test('a number', function() {
    assert.deepEqual(
      evalScheem(['quote', 3], {}),
      3
    );
  });
  test('an atom', function() {
    assert.deepEqual(
      evalScheem(['quote', 'dog'], {}),
      'dog'
    );
  });
  test('a list', function() {
    assert.deepEqual(
      evalScheem(['quote', ['+', 2, 3]], {}),
      ['+', 2, 3]
    );
  });
  test('a nested list', function() {
    assert.deepEqual(
      evalScheem(['quote', [1, ['quote',[2,3]], 4]], {}),
      [1, ['quote',[2,3]], 4]
    );
  });
});

suite('addition and subtraction', function() {
  test('add two numbers', function() {
    assert.deepEqual(
      evalScheem(['+', 3, 5], {}),
      8
    );
  });
  test('subtract two numbers', function() {
    assert.deepEqual(
      evalScheem(['-', 3, 5], {}),
      -2
    );
  });
  test('add a number and an expression', function() {
    assert.deepEqual(
      evalScheem(['+', 15, ['-', 6, 8]], {}),
      13
    );
  });
  test('subtract a number and an expression', function() {
    assert.deepEqual(
      evalScheem(['-', 15, ['+', 6, 3]], {}),
      6
    );
  });
  test('add an expression and a number', function() {
    assert.deepEqual(
      evalScheem(['+', ['-', 6, 2], 5], {}),
      9
    );
  });
  test('subtract an expression and a number', function() {
    assert.deepEqual(
      evalScheem(['-', ['+', 16, 3], 4], {}),
      15
    );
  });
  test('add an expression and an expression', function() {
    assert.deepEqual(
      evalScheem(['+', ['-', 6, 2], ['+', 8, -2]], {}),
      10
    );
  });
  test('subtract an expression and an expression', function() {
    assert.deepEqual(
      evalScheem(['-', ['-', 6, 2], ['+', 8, 11]], {}),
      -15
    );
  });
});

suite('division and multiplication', function() {
  test('multiply two numbers', function() {
    assert.deepEqual(
      evalScheem(['*', 3, 5], {}),
      15
    );
  });
  test('divide two numbers', function() {
    assert.deepEqual(
      evalScheem(['/', 27, 9], {}),
      3
    );
  });
  test('multiply a number and an expression', function() {
    assert.deepEqual(
      evalScheem(['*', 3, ['*', 4, 2]], {}),
      24
    );
  });
  test('divide a number and an expression', function() {
    assert.deepEqual(
      evalScheem(['/', 56, ['/', 49, 7]], {}),
      8
    );
  });
  test('multiply an expression and a number', function() {
    assert.deepEqual(
      evalScheem(['*', ['/', 6, 2], 5], {}),
      15
    );
  });
  test('divide an expression and a number', function() {
    assert.deepEqual(
      evalScheem(['/', ['*', 16, 3], 12], {}),
      4
    );
  });
  test('multiply an expression and an expression', function() {
    assert.deepEqual(
      evalScheem(['*', ['/', 6, 2], ['*', 8, -2]], {}),
      -48
    );
  });
  test('divide an expression and an expression', function() {
    assert.deepEqual(
      evalScheem(['/', ['*', 6, 2], ['/', 24, 8]], {}),
      4
    );
  });
});

suite('environment', function() {
  test('evaluate number, do not change environment', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    var evald = evalScheem(5, env);
    assert.deepEqual(env, {bindings: {a:4, b:2}, outer: {} });
    assert.deepEqual(evald, 5);
  });
  test('evaluate variable, do not change environment', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    var evald = evalScheem('b', env);
    assert.deepEqual(env, {bindings: {a:4, b:2}, outer: {} });
    assert.deepEqual(evald, 2);
  });
  test('define a variable with {} environment', function() {
    var env = {};
    evalScheem(['define', 'c', 5], env);
    assert.deepEqual(env, {bindings: { c:5 }, outer: {} });
  });
  test('define a variable', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    evalScheem(['define', 'c', 5], env);
    assert.deepEqual(env, {bindings: {a:4, b:2, c:5}, outer: {} });
  });
  test('set a variable', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    evalScheem(['set!', 'b', 6], env);
    assert.deepEqual(env, {bindings: {a:4, b:6}, outer: {} });
  });
  test('define a variable as evaluated expression', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    evalScheem(['define', 'c', ['+',3,2]], env);
    assert.deepEqual(env, {bindings: {a:4, b:2, c:5}, outer: {} });
  });
  test('set a variable to evaluated expression', function() {
    var env = {bindings: {a:4, b:2}, outer: {} };
    evalScheem(['set!', 'b', ['+',3,2]], env);
    assert.deepEqual(env, {bindings: {a:4, b:5}, outer: {} });
  });
});

suite('begin', function() {
  test('no environment changes', function() {
    var env = {bindings: {a:12, b:23}, outer: {} };
    assert.deepEqual(
      evalScheem(['begin', 3, 12, 7], env),
      7
    );
    assert.deepEqual(env, {bindings: {a:12, b:23}, outer: {} });
  });
  
  test('no environment changes with evaluating expressions', function() {
    var env = {bindings: {a:12, b:23}, outer: {} };
    assert.deepEqual(
      evalScheem(['begin', ['+',3,4], 'a', ['-',5,2]], env),
      3
    );
    assert.deepEqual(env, {bindings: {a:12, b:23}, outer: {} });
  });
  
  test('environment changes with set and define', function() {
    var env = {bindings: {a:12, b:23}, outer: {} };
    assert.deepEqual(
      evalScheem(['begin', 'a', ['define','c','a'], 'c', ['set!','b',['+',7,5]], ['quote', 'ok']], env),
      'ok'
    );
    assert.deepEqual(env, {bindings: {a:12, b:12, c:12}, outer: {} });
  });

});

suite('operators "=" and "<"', function() {
  test('2 equals 2', function() {
    assert.deepEqual(
      evalScheem(['=', 2, 2], {}),
      '#t'
    );
  });
  test('2 not equals 3', function() {
    assert.deepEqual(
      evalScheem(['=', 2, 3], {}),
      '#f'
    );
  });
  test('2 < 3', function() {
    assert.deepEqual(
      evalScheem(['<', 2, 3], {}),
      '#t'
    );
  });
  test('(6/2) not < (8/4)', function() {
    assert.deepEqual(
      evalScheem(['<', ['/',6,2], ['/',8,4]], {}),
      '#f'
    );
  });
  test('expressions with "="', function() {
    assert.deepEqual(
      evalScheem(['=', ['-',7,5], ['/','a',6]], {bindings: {a:12, b:23}, outer: {} }),
      '#t'
    );
  });
  test('expressions with "<"', function() {
    assert.deepEqual(
      evalScheem(['<', ['-',7,5], ['/','a',6]], {bindings: {a:12, b:23}, outer: {} }),
      '#f'
    );
  });
});

suite('if', function() {
  test('simple, if branch', function() {
    assert.deepEqual(
      evalScheem(['if', '#t', 2, 3], {}),
      2
    );
  });
  test('simple, else branch', function() {
    assert.deepEqual(
      evalScheem(['if', '#f', 2, 3], {}),
      3
    );
  });
  test('expressions, if branch', function() {
    var env = {bindings: {a:12}, outer: {} };
    var evald = evalScheem(['if', ['=', ['-',7,5], ['/','a',6]], 
         ['begin', ['define','b',3], ['+',2,3]], 
         ['begin', ['define','c',4], ['+',3,4]]]
      , env);
    assert.deepEqual(evald, 5);
    assert.deepEqual(env, {bindings: {a:12, b:3}, outer: {} });
  });
  test('expressions, else branch', function() {
    var env = {bindings: {a:12}, outer: {} };
    var evald = evalScheem(['if', ['=', ['-',7,5], ['/','a',3]], 
         ['begin', ['define','b',3], ['+',2,3]], 
         ['begin', ['define','c',4], ['+',3,4]]]
      , env);
    assert.deepEqual(evald, 7);
    assert.deepEqual(env, {bindings: {a:12, c:4}, outer: {} });
  });
});

suite('cons, car, cdr', function() {
  test('cons simple', function() {
    assert.deepEqual(
      evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
      [1,2,3]
    );
  });
  test('cons two numbers', function() {
    assert.deepEqual(
      evalScheem(['cons', 1, 2], {}),
      [1,2]
    );
  });
  test('cons two numbers, quoted first', function() {
    assert.deepEqual(
      evalScheem(['cons', ['quote',1], 2], {}),
      [1,2]
    );
  });
  test('cons two numbers, quoted first', function() {
    assert.deepEqual(
      evalScheem(['cons', ['quote',1], ['quote',2]], {}),
      [1,2]
    );
  });
  test('cons two numbers, quoted both', function() {
    assert.deepEqual(
      evalScheem(['cons', ['quote',1], ['quote',2]], {}),
      [1,2]
    );
  });
  test('cons', function() {
    assert.deepEqual(
      evalScheem(['cons', ['quote', [1, 2]], ['quote', [3, 4]]] , {}),
      [[1,2],3,4]
    );
  });
  test('car', function() {
    assert.deepEqual(
      evalScheem(['car', ['quote', [[1, 2], 3, 4]]], {}),
      [1,2]
    );
  });
  test('cdr', function() {
    assert.deepEqual(
      evalScheem(['cdr', ['quote', [[1, 2], 3, 4, 5]]], {}),
      [3,4,5]
    );
  });
  test('cdr empty', function() {
    assert.deepEqual(
      evalScheem(['cdr', ['quote', [1]] ], {}),
      []
    );
  });
});