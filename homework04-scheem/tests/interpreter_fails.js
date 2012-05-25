var assert = chai.assert;

suite('error checking, wrong number of parameters', function() {
  test('quote no params', function() {
    assert.throws(function() {
      evalScheem(['quote'], {});
    });
  });
  test('quote extra params', function() {
    assert.throws(function() {
      evalScheem(['quote', 3, 2], {});
    });
  });
  
  test('addition, no params', function() {
    assert.throws(function() {
      evalScheem(['+'], {});
    });
  });
  test('subtraction, no params', function() {
    assert.throws(function() {
      evalScheem(['-'], {});
    });
  });
  test('multiplication, no params', function() {
    assert.throws(function() {
      evalScheem(['*'], {});
    });
  });
  test('division, no params', function() {
    assert.throws(function() {
      evalScheem(['/'], {});
    });
  });
  
  test('addition, 1 param', function() {
    assert.throws(function() {
      evalScheem(['+', 3], {});
    });
  });
  test('subtraction, 1 param', function() {
    assert.throws(function() {
      evalScheem(['-', 3], {});
    });
  });
  test('addition, 3 params', function() {
    assert.throws(function() {
      evalScheem(['+', 3, 2, 9], {});
    });
  });
  test('subtraction, 3 params', function() {
    assert.throws(function() {
      evalScheem(['-', 3, 2, 9], {});
    });
  });
  
  test('multiplication, 1 param', function() {
    assert.throws(function() {
      evalScheem(['*', 3], {});
    });
  });
  test('division, 1 param', function() {
    assert.throws(function() {
      evalScheem(['/', 3], {});
    });
  });
  test('multiplication, 3 params', function() {
    assert.throws(function() {
      evalScheem(['*', 3, 2, 9], {});
    });
  });
  test('division, 3 params', function() {
    assert.throws(function() {
      evalScheem(['/', 3, 2, 9], {});
    });
  });
  
  test('begin, no params', function() {
    assert.throws(function() {
      evalScheem(['begin'], {});
    });
  });
  test('cons, no params', function() {
    assert.throws(function() {
      evalScheem(['cons'], {});
    });
  });
  test('car, no params', function() {
    assert.throws(function() {
      evalScheem(['car'], {});
    });
  });
  test('cdr, no params', function() {
    assert.throws(function() {
      evalScheem(['cdr'], {});
    });
  });
  
  test('cons, 1 param', function() {
    assert.throws(function() {
      evalScheem(['cons', ['quote',2]], {});
    });
  });
  test('cons, 3 params', function() {
    assert.throws(function() {
      evalScheem(['cons', ['quote',2], [3,4], 5], {});
    });
  });
  test('car, 2 params', function() {
    assert.throws(function() {
      evalScheem(['car', [1,2], [3,4]], {});
    });
  });
  test('cdr, 2 params', function() {
    assert.throws(function() {
      evalScheem(['cdr', [1,2], [3,4]], {});
    });
  });
  
  
  test('if, no params', function() {
    assert.throws(function() {
      evalScheem(['if'], {});
    });
  });
  test('if, 1 param', function() {
    assert.throws(function() {
      evalScheem(['if', '#t'], {});
    });
  });
  test('if, 2 params', function() {
    assert.throws(function() {
      evalScheem(['if', '#t', 3], {});
    });
  });
  test('if, 4 params', function() {
    assert.throws(function() {
      evalScheem(['if', '#t', 3, 4, 5], {});
    });
  });
  
  
  test('=, no params', function() {
    assert.throws(function() {
      evalScheem(['='], {});
    });
  });
  test('<, no params', function() {
    assert.throws(function() {
      evalScheem(['<'], {});
    });
  });
  test('=, 1 param', function() {
    assert.throws(function() {
      evalScheem(['=', 3], {});
    });
  });
  test('<, 1 param', function() {
    assert.throws(function() {
      evalScheem(['<', 3], {});
    });
  });
  test('=, 3 params', function() {
    assert.throws(function() {
      evalScheem(['=', 3, 2, 9], {});
    });
  });
  test('<, 3 params', function() {
    assert.throws(function() {
      evalScheem(['<', 3, 2, 9], {});
    });
  });
  
  
  test('set!, no params', function() {
    assert.throws(function() {
      evalScheem(['set!'], {});
    });
  });
  test('define, no params', function() {
    assert.throws(function() {
      evalScheem(['define'], {});
    });
  });
  test('set!, 1 param', function() {
    assert.throws(function() {
      evalScheem(['set!', 3], {});
    });
  });
  test('define, 1 param', function() {
    assert.throws(function() {
      evalScheem(['<', define], {});
    });
  });
  test('set!, 3 params', function() {
    assert.throws(function() {
      evalScheem(['set!', 3, 2, 9], {});
    });
  });
  test('define, 3 params', function() {
    assert.throws(function() {
      evalScheem(['define', 3, 2, 9], {});
    });
  });
});


suite('error checking, parameter inspection', function() {
  test('add string and number', function() {
    assert.throws(function() {
      evalScheem(['+', ['quote','f'], 5], {});
    });
  });
  test('add number and string', function() {
    assert.throws(function() {
      evalScheem(['+', 5, ['quote','f']], {});
    });
  });
  test('add two strings', function() {
    assert.throws(function() {
      evalScheem(['+', ['quote','f'], ['quote','g']], {});
    });
  });
  
  test('subtract string and number', function() {
    assert.throws(function() {
      evalScheem(['-', ['quote','f'], 5], {});
    });
  });
  test('subtract number and string', function() {
    assert.throws(function() {
      evalScheem(['-', 5, ['quote','f']], {});
    });
  });
  test('subtract two strings', function() {
    assert.throws(function() {
      evalScheem(['-', ['quote','f'], ['quote','g']], {});
    });
  });
  
  test('multiply string and number', function() {
    assert.throws(function() {
      evalScheem(['*', ['quote','f'], 5], {});
    });
  });
  test('multiply number and string', function() {
    assert.throws(function() {
      evalScheem(['*', 5, ['quote','f']], {});
    });
  });
  test('multiply two strings', function() {
    assert.throws(function() {
      evalScheem(['*', ['quote','f'], ['quote','g']], {});
    });
  });
  
  test('divide string and number', function() {
    assert.throws(function() {
      evalScheem(['/', ['quote','f'], 5], {});
    });
  });
  test('divide number and string', function() {
    assert.throws(function() {
      evalScheem(['/', 5, ['quote','f']], {});
    });
  });
  test('divide two strings', function() {
    assert.throws(function() {
      evalScheem(['/', ['quote','f'], ['quote','g']], {});
    });
  });
  
  test('if condition', function() {
    assert.throws(function() {
      evalScheem(['if', ['quote','#g'], 2, 3], {});
    });
  });
  
  test('cons with non-list', function() {
    assert.throws(function() {
      evalScheem(['cons', ['quote',1], ['quote', 2]], {});
    });
  });
  test('car with non-list', function() {
    assert.throws(function() {
      evalScheem(['car', ['quote',1]], {});
    });
  });
  test('cdr with non-list', function() {
    assert.throws(function() {
      evalScheem(['cdr', ['quote',1]], {});
    });
  });
  
  test('car with empty list', function() {
    assert.throws(function() {
      evalScheem(['car', ['quote',[]]], {});
    });
  });
  test('cdr with empty list', function() {
    assert.throws(function() {
      evalScheem(['cdr', ['quote',[]]], {});
    });
  });
  
  test('set an undefined variable', function() {
    assert.throws(function() {
      evalScheem(['set!', 'x', 2], {});
    });
  });
  test('define an already defined variable', function() {
    assert.throws(function() {
      evalScheem(['define', 'x', 2], {x: 3});
    });
  });
  
  
});