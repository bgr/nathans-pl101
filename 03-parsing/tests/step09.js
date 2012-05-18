var PEG = require('pegjs');
var assert = require('nodeunit').assert;
var fs = require('fs');

var pegDataPath = './step09-homework1.pegjs';


var simple = {
  'a': 'a', 
  'abc': 'abc', 
  '(x)': ['x'], 
  '(x y)': ['x','y'],
  '(abc def)': ['abc','def'],
  'a2!1': 'a2!1',
  '(a2!1 + 76)': ['a2!1','+','76'],
  '(a (b c))': ['a', ['b','c']], 
  '(a ((b c) d e))': ['a', [ ['b','c'], 'd', 'e'] ], 
  '(a (b c) d e)': ['a', ['b','c'], 'd', 'e'], 
  '(ab cd (ef))': ['ab', 'cd', ['ef']], 
  '(ab (cd! (+ ef (gh ij)) klmn) (op q (r)))': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]] 
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
  '\t(   ab\t(\t\tcd!\t(   +\t \tef   (\t\tgh ij)) klmn)\t (op\tq\t(   r   )\t)  )\t': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]]
  };
  
var fails = ['(', '(x', ')', 'x)', ')(', '(()', '())', ')x(', '(x()', '((x)', '())x',
'  (', '(  x', '\t )\t', '\t\tx\t\t)', ')   (', '\t(\t(\t\t)', '\t\t())', '   ) x  (', '\t\t\t (  \t x()', '((x)', '   ( \t )\t\t)x', '(abc (  def)', '  \t(  abc (  def g)  ))'];

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

exports.testFails = function(test) {
  for(var k in fails) {
    test.throws(function() { parse(fails[k]); }, PEG.SyntaxError );
  }
  test.done();
}