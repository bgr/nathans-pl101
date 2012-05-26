var assert = chai.assert;

suite('parsing Scheem code', function() {
  test('a number', function() {
    assert.deepEqual(
      SCHEEM.parse('42'),
      42
    );
  });
  test('a variable', function() {
    assert.deepEqual(
      SCHEEM.parse('x'),
      'x'
    );
  });
  test('a list', function() {
    assert.deepEqual(
      SCHEEM.parse('(1 2 3)'),
      [1,2,3]
    );
  });
  test('a list with whitespace and comments', function() {
    assert.deepEqual(
      SCHEEM.parse('\t( 1\r\n 2 3\t\t;; a comment\r)\t'),
      [1,2,3]
    );
  });
  test('"less than" operator', function() {
    assert.deepEqual(
      SCHEEM.parse('(< 3 4)'),
      ['<',3,4]
    );
  });
  test('"equals" operator', function() {
    assert.deepEqual(
      SCHEEM.parse('(= 3 4)'),
      ['=',3,4]
    );
  });
  
  test('complex parse', function() {
    assert.deepEqual(
      // see scheem_code_snippet.txt for clean version
      SCHEEM.parse("(begin (define x 5) (define yz9 (+ 2 7)) (set! x (if (= 4 (car (cdr ;; = 3, got from (2 3 4) -> (3 4) -> 3 \r (cons (/ 8 4) '(3 4)) )) ;; (2 3 4) \r ) nothing-to-see-here ;; else \r (begin (set! yz9 (* yz9 11)) ;; yz9 = 99 \r (- yz9 7) ;; return 92 \r ) ) ) ;; set x to 92 \r (* yz9 x) ;; return 99*92=9108 \r )"),
      ['begin', 
        ['define', 'x', 5], 
        ['define', 'yz9', ['+', 2, 7]], 
        ['set!', 'x', 
          ['if', ['=', 4, ['car', ['cdr', ['cons', ['/', 8, 4], ['quote', [3, 4]] ] ]]],
            'nothing-to-see-here', 
            ['begin', 
              ['set!', 'yz9', ['*', 'yz9', 11]], 
              ['-', 'yz9', 7]
            ]
          ]
        ],
        ['*', 'yz9', 'x']
      ]
    );
  });
});

suite('parse and interpret', function() {
  test('number', function() {
    assert.deepEqual(
      evalScheemString('4',{}),
      4
    );
  });
  test('variable', function() {
    assert.deepEqual(
      evalScheemString('abc',{bindings: {abc:5}, outer: {} }),
      5
    );
  });
  test('"less than" operator', function() {
    assert.deepEqual(
      evalScheemString('(< 3 5)',{}),
      '#t'
    );
  });
  test('nested "less than" operator', function() {
    assert.deepEqual(
      evalScheemString('(< (* 4 5) (/ 180 10))',{}),
      '#f'
    );
  });
  
  
  test('complex', function() {
    var env = {bindings: {abc:34, def:56}, outer: {} };
    assert.deepEqual(
      // see scheem_code_snippet.txt for clean version
      evalScheemString("(begin (define x 5) (define yz9 (+ 2 7)) (set! x (if (= 4 (car (cdr ;; = 3, got from (2 3 4) -> (3 4) -> 3 \r (cons (/ 8 4) '(3 4)) )) ;; (2 3 4) \r ) nothing-to-see-here ;; else \r (begin (set! yz9 (* yz9 11)) ;; yz9 = 99 \r (- yz9 7) ;; return 92 \r ) ) ) ;; set x to 92 \r (* yz9 x) ;; return 99*92=9108 \r )",env),
      9108
    );
    assert.deepEqual(env, {bindings: {abc:34, def:56, x:92, yz9:99}, outer: {} });
  });
  
});

