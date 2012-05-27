var PEG = require('pegjs');
var assert = require('nodeunit').assert;
var fs = require('fs');

var pegDataPath = './step09-homework1.pegjs';


var simple = {
  'a': 'a', 
  'abc': 'abc', 
  '(x)': ['x'], 
  '()': [],
  '(x y)': ['x','y'],
  '(abc def)': ['abc','def'],
  '(x ())': ['x', []],
  '(() x)': [[], 'x'],
  '((()) (()))': [[[]], [[]]],
  'a2!1': 'a2!1',
  '(a2!1 + 76)': ['a2!1','+','76'],
  '(a (b c))': ['a', ['b','c']], 
  '(a ((b c) d e))': ['a', [ ['b','c'], 'd', 'e'] ], 
  '(a (b c) d e)': ['a', ['b','c'], 'd', 'e'], 
  '(ab cd (ef))': ['ab', 'cd', ['ef']], 
  '(ab (cd! (+ ef (gh ij)) klmn) (op q (r)))': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]],
};

var whitespace = {
  ' a': 'a', 
  'a ': 'a', 
  '  a': 'a', 
  'a  ': 'a', 
  '   a': 'a', 
  'a   ': 'a', 
  ' a ': 'a', 
  '   a    ': 'a', 
  '\ta': 'a', 
  'a\t': 'a', 
  ' \ta': 'a', 
  'a \t': 'a', 
  '\ta\t': 'a', 
  '\t\ta\t\t': 'a', 
  ' abc': 'abc', 
  'abc ': 'abc', 
  '\tabc': 'abc', 
  'abc\t': 'abc', 
  '( x)': ['x'], 
  '(x )': ['x'], 
  ' (x)': ['x'], 
  '(x) ': ['x'], 
  ' ( x)': ['x'], 
  '(x ) ': ['x'], 
  '( x )': ['x'], 
  ' (x) ': ['x'], 
  ' ( x) ': ['x'], 
  ' (x ) ': ['x'], 
  '( )': [],
  '  ( )': [],
  '(   )  ': [],
  '  (    )  ': [],
  '  ( ( ( ) ) \t(\t(\t)\t)\t)\t ': [[[]], [[]]],
  '\t(\t)\t': [],
  '(\tx)': ['x'], 
  '\t(x)': ['x'], 
  '(x\t)': ['x'], 
  '(x)\t': ['x'], 
  '\t(x)\t': ['x'], 
  '\t(\tx\t)\t': ['x'], 
  '\t(\t x \t)\t': ['x'], 
  '  \t( \tx\t )\t  ': ['x'], 
  '  \t ( \tx\t )  \t  ': ['x'], 
  '(x   y)': ['x','y'],
  ' (  x   y  )  ': ['x','y'],
  '\t(x\ty)\t': ['x','y'],
  '\t\t\t(x\t\t\ty)\t\t\t': ['x','y'],
  '  (abc   def)  ': ['abc','def'],
  '\t\t(abc\t\t\tdef)\t\t \t\t': ['abc','def'],
  'a2!1': 'a2!1',
  ' a2!1': 'a2!1',
  'a2!1 ': 'a2!1',
  '\ta2!1': 'a2!1',
  'a2!1\t': 'a2!1',
  '\ta2!1\t': 'a2!1',
  '\t a2!1 \t': 'a2!1',
  ' \ta2!1\t ': 'a2!1',
  '  \ta2!1\t  ': 'a2!1',
  '  \t  a2!1 \t  ': 'a2!1',
  ' (  a2!1    +  76  )  ': ['a2!1','+','76'],
  '\t(\ta2!1\t+\t76\t)\t': ['a2!1','+','76'],
  '\t(a   (b\t\tc   ) )': ['a', ['b','c']], 
  '   (   ab cd (ef)\t\t)\t\t': ['ab', 'cd', ['ef']], 
  '\t(   ab\t(\t\tcd!\t(   +\t \tef   (\t\tgh ij)) klmn)\t (op\tq\t(   r   )\t)  )\t': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]],
  };
  
var quote = {
  "'a": ['quote', 'a'],
  "'abc": ['quote','abc'],
  "'(x)": ['quote', ['x']],
  "'(x y)": ['quote', ['x','y']],
  "(abc 'def)": ['abc', ['quote','def']],
  "'a2!1": ['quote','a2!1'],
  "(a2!1 '+ 76)": ['a2!1',['quote','+'],'76'],
  "'(a '(b c))": ['quote',['a', ['quote',['b','c']]]], 
  "'(a ('('b 'c) d e))": ['quote',['a', [ ['quote',[['quote','b'],['quote','c']]], 'd', 'e'] ]], 
};


var quoteWhitespace = {
  "  'a": ['quote', 'a'],
  "'abc  ": ['quote','abc'],
  "'(  x  )": ['quote', ['x']],
  "   '(\tx\t\ty\t)   ": ['quote', ['x','y']],
  "\t\t(\tabc\t'def\t)\t": ['abc', ['quote','def']],
  " \t\t 'a2!1 \t  ": ['quote','a2!1'],
  "   (\ta2!1\t'+\t76\t)": ['a2!1',['quote','+'],'76'],
  "   '(a\t \t'(b c))": ['quote',['a', ['quote',['b','c']]]], 
  "\t\t'(a (   '(   'b\t\t'c) d e))": ['quote',['a', [ ['quote',[['quote','b'],['quote','c']]], 'd', 'e'] ]], 
};

var operators = {
  "(+ 1 2)": ['+', 1, 2],
  "(- 1 2)": ['-', 1, 2],
  "(* 1 2)": ['*', 1, 2],
  "(/ 1 2)": ['/', 1, 2],
  "(= 2 4)": ['=', 2, 4],
  "(< 3 5)": ['<', 3, 5],
  "( < ( = ( + 2 3) ( - 4 5)) (+ (- 23 ( / 12 2)) ( * (+ 2 3) 4)))": ['<', ['=',['+',2,3],['-',4,5]], ['+', ['-', 23, ['/', 12, 2]], ['*', ['+', 2, 3], 4] ] ],
};

var comments = {
  'a;; comment': 'a',
  'a ;;comment': 'a',
  'a;; comment more words': 'a',
  'a ;; comment more words': 'a',
  'a;; comment newline\n': 'a',
  'a;; comment newline\r': 'a',
  'a;; comment newline\r\n': 'a',
  ';; comment before\ra': 'a',
  ';; comment before\na': 'a',
  ';; comment before\r\na': 'a',
  '    ;; comment before\r\na': 'a',
  '\t\t;; comment before\r\na': 'a',
  '\t\t;; comment before\r\n   a': 'a',
  '\t\t;; comment before\r\n\t\ta': 'a',
  ';;;;;; comment\r\na': 'a',
  ';; comment before\r\na;;and after': 'a',
  ';; comment before\r\na;;and after\r': 'a',
  ';; comment before\r\na;;and after\n': 'a',
  ';; comment before\r\na;;and after\r\n': 'a',
  ';; comment before\r\na;;and after\r\r\r': 'a',
  ';; comment before\r\na;;and after\r\r\r\n': 'a',
  ';; comment before\r\n\na;;and after\r\n\r\n': 'a',
  ';; comment before\n\r\na;;and after\r\n\r\r\n': 'a',
  ';;cmt\rabc': 'abc', 
  '(x;;cmt\r)': ['x'], 
  '(x y;;cmt\n)': ['x','y'],
  '(abc;;cmt\rdef   ;; cmt 2\n);;cmt 3\n;;cmt 4': ['abc','def'],
  'a2!1;;cmt\r\n;;cmt 2\r\n': 'a2!1',
  ';; cmt\r\n\r\n;;cmt 2\r\n(;;\r\nab;; asd \r\n (cd! (;;cmt \r  + ef (gh ;;cmt\t2\t\r\tij)) ;;cmt  \r klmn);; comment\n\r (op q (r)));; end cmt': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]],
  ";; c m\r;; c m\n'(;; c m\r\nab  ;;\n\r  ;;\r  '(cd! (;;xx\n   + ef ('gh ;;xx\r\n  ij)) ;;xx\n\r\r\n klmn);;xx\r (;;\n;;\r\nop;;\n\r  ;;\nq ;;\r;;\r\n\r\n(  ;;\n\r;;\r\rR;;\n\r;;\r);;\r;;\r);;\r;;\r);; end cmt": ['quote', ['ab', ['quote', ['cd!', ['+','ef', [['quote', 'gh'], 'ij']], 'klmn' ]], ['op', 'q', ['R']]]]
};
  
var fails = ['a b', /*'()', '( )', '(   )',*/ 'a (b)', '(a b) c', '(a b) (c)', '(', '(x', ')', 'x)', ')(', '(()', '())', ')x(', '(x()', '((x)', '())x', '  (', '(  x', '\t )\t', '\t\tx\t\t)', ')   (', '\t(\t(\t\t)', '\t\t())', '   ) x  (', '\t\t\t (  \t x()', '((x)', '   ( \t )\t\t)x', '(abc (  def)', '  \t(  abc (  def g)  ))', "'(", "('x", "')", "x')", ")'(", "(()", "())", ")'x(", "(x()", "((x)", "())x", "  (", "(  x", "\t )\t", "\t\tx\t\t)", ")   (", "\t(\t'(\t\t)", "\t\t())", "   ) x  (", "'\t\t\t (  \t x()", "((x)", "   ( \t )\t\t)'x", "(abc ( ' def)", "  \t(  abc (  'def g)  ))", "' x", "' (a b)", "(' a b)", "(  ' a b)", "'  (a)"];



var pegData = fs.readFileSync(pegDataPath, 'utf-8');
var parse = PEG.buildParser(pegData).parse;


exports.testSimple = function(test) {
  for(var k in simple) {
    test.deepEqual(parse(k), simple[k]);
  }
  test.done();
}

exports.testWhitespace = function(test) {
  for(var k in whitespace) {
    test.deepEqual(parse(k), whitespace[k]);
  }
  // change tabs to newlines
  for(var k in whitespace) {
    var cr = k.replace('\t','\r');
    var lf = k.replace('\t','\n');
    var crlf = k.replace('\t','\r\n');
    test.deepEqual(parse(cr), whitespace[k]);
    test.deepEqual(parse(lf), whitespace[k]);
    test.deepEqual(parse(crlf), whitespace[k]);
  }
  test.done();
}

exports.testQuote = function(test) {
  for(var k in quote) {
    test.deepEqual(parse(k), quote[k]);
  }
  test.done();
}

exports.testQuoteWhitespace = function(test) {
  for(var k in quoteWhitespace) {
    test.deepEqual(parse(k), quoteWhitespace[k]);
  }
  test.done();
}

exports.testComments = function(test) {
  for(var k in comments) {
    test.deepEqual(parse(k), comments[k]);
  }
  test.done();
}

exports.testOperators = function(test) {
  for(var k in operators) {
    test.deepEqual(parse(k), operators[k]);
  }
  test.done();
}

exports.testFails = function(test) {
  for(var k in fails) {
    test.throws(function() { parse(fails[k]); }, PEG.SyntaxError );
  }
  test.done();
}