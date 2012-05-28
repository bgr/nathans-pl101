var assert = chai.assert;
var evalScheemString = EvalScheem.parseAndEval;
var InterpreterError = EvalScheem.InterpreterError;

/*
suite('eq?', function() {
  test('1!=1', function() {
    assert.deepEqual(evalScheemString('(eq? 1 1)', {}), '#t');
  });
  test('1!=2', function() {
    assert.deepEqual(evalScheemString('(eq? 1 2)', {}), '#f');
  });
  test('a=a', function() {
    assert.deepEqual(evalScheemString('(eq? a a)', { bindings:{a:23}} ), '#t');
  });
  test('a=b (have same values)', function() {
    assert.deepEqual(evalScheemString('(eq? a b)', { bindings:{a:23, b:23}} ), '#t');
  });
  test('a!=b', function() {
    assert.deepEqual(evalScheemString('(eq? a b)', { bindings:{a:23, b:3}} ), '#f');
  });
});
*/

suite('list procedures', function() {
  test('list? non-empty', function() {
    assert.deepEqual(evalScheemString("(list? '(1 2 3))", {}), '#t');
  });
  test('list? empty', function() {
    assert.deepEqual(evalScheemString("(list? '())", {}), '#t');
  });
  test('list? nil', function() {
    assert.deepEqual(evalScheemString("(list? ())", {}), '#t');
  });
  test('list? reference non-list', function() {
    assert.deepEqual(evalScheemString("(list? abc)", { bindings:{abc:2}, outer:{} }), '#f');
  });
  test('list? reference list', function() {
    assert.deepEqual(evalScheemString("(list? abc)", { bindings:{abc:[]}, outer:{} }), '#t');
  });
  
  test('length non-empty', function() {
    assert.deepEqual(evalScheemString("(length '(1 2 3))", {}), 3);
  });
  test('length empty', function() {
    assert.deepEqual(evalScheemString("(length '())", {}), 0);
  });
  test('length nested', function() {
    assert.deepEqual(evalScheemString("(length '(1 (2 3 4) 5 6))", {}), 4);
  });
  test('length nil', function() {
    assert.deepEqual(evalScheemString("(length ())", {}), 0);
  });
  test('length reference non-empty', function() {
    assert.deepEqual(evalScheemString("(length abc)", { bindings:{abc:[1,2,3]}, outer:{} }), 3);
  });
  test('length reference empty', function() {
    assert.deepEqual(evalScheemString("(length abc)", { bindings:{abc:[]}, outer:{} }), 0);
  });
  
  test('null? non-empty', function() {
    assert.deepEqual(evalScheemString("(null? '(1 2 3))", {}), '#f');
  });
  test('null? non-list', function() {
    assert.deepEqual(evalScheemString("(null? 2)", {}), '#f');
  });
  test('null? empty', function() {
    assert.deepEqual(evalScheemString("(null? '())", {}), '#t');
  });
  test('null? nil', function() {
    assert.deepEqual(evalScheemString("(null? ())", {}), '#t');
  });
  test('null? variable []', function() {
    assert.deepEqual(evalScheemString("(null? abc)", { bindings:{abc:[]}, outer:{} }), '#t');
  });
  test('null? variable number', function() {
    assert.deepEqual(evalScheemString("(null? abc)", { bindings:{abc:2}, outer:{} }), '#f');
  });
  
  test('map', function() {
    assert.deepEqual(evalScheemString("(begin (define map (lambda (ls fn) (if (null? ls) () (cons (fn (car ls)) (map (cdr ls) fn)) ))) (map '(1 2 3 4 5) (lambda (x) (* x x))) )", {}), [1,4,9,16,25]);
  });
  test('flatten', function() {
    assert.deepEqual(evalScheemString("(begin (define foldr (lambda (fn ac ls) (if (null? ls) ac (fn (car ls) (foldr fn ac (cdr ls))) ))) (define flatten (lambda (a b) (if (list? a) (if (null? a) b (foldr flatten b a))  (cons a b)) )) (foldr flatten () '((1) (2 3) 4 (((5) 6) (7)) ((8)))))", {}), [1,2,3,4,5,6,7,8]);
  });
  
});