var PEG = require('pegjs');
var assert = require('nodeunit').assert;
var fs = require('fs');

var pegDataPath = './step05-scheem_syntax.pegjs';

var passes = {
  'a': 'a', 
  'abc': 'abc', 
  '(x)': ['x'], 
  '(x y)': ['x','y'],
  '(abc def)': ['abc','def'],
  'a2!1': 'a2!1',
  '(a2!1 + 76)': ['a2!1','+','76'],
  '(a (b c))': ['a', ['b','c']], 
  '(ab cd (ef))': ['ab', 'cd', ['ef']], 
  '(ab (cd! (+ ef (gh ij)) klmn) (op q (r)))': ['ab', ['cd!', ['+', 'ef', ['gh','ij']], 'klmn'], ['op','q',['r']]]
  };
var fails = ['(', '(x', ')', 'x)', ')(', '(()', '())', ')x(', '(x()', '((x)', '())x'];

var pegData = fs.readFileSync(pegDataPath, 'utf-8');
var parse = PEG.buildParser(pegData).parse;


exports.testPasses = function(test) {
  for(var k in passes) {
    test.deepEqual(parse(k), passes[k]);
  }
  test.done();
}

exports.testFails = function(test) {
  for(var k in fails) {
    test.throws(function() { parse(fails[k]); }, PEG.SyntaxError );
  }
  test.done();
}