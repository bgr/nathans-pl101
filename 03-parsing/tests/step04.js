var PEG = require('pegjs');
var assert = require('nodeunit').assert;
var fs = require('fs');

var pegDataPath = './step04-word_lists.pegjs';

var passes = {
  'x': ['x'], 
  'dog': ['dog'], 
  'big dog': ['big','dog'], 
  'x y': ['x','y'],
  'three worded dog': ['three','worded','dog'], 
  'this line has a lot of words': ['this','line','has','a','lot','of','words']
  };

var fails = ['Big dog', 'big Dog', 'big  dog', 'thRee wordeD dog', 'three worded, dog'];

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