var PEG = require('pegjs');
var assert = require('nodeunit').assert;
var fs = require('fs');

var pegDataPath = './step10-homework2.pegjs';


var simple = {
  'a0.1': { tag: 'note', pitch: 'a0', dur: '1' },
  'b1.20': { tag: 'note', pitch: 'b1', dur: '20' },
  'c9.158': { tag: 'note', pitch: 'c9', dur: '158' },
  'D10.1000': { tag: 'note', pitch: 'd10', dur: '1000' },
  'E99.23456': { tag: 'note', pitch: 'e99', dur: '23456' },
  'F234.567890': { tag: 'note', pitch: 'f234', dur: '567890' },
  '_.25': { tag: 'rest', dur: '25' },
  'a1.10 b2.20': { tag: 'seq', 'left': { tag: 'note', pitch: 'a1', dur: '10' }, right: { tag: 'note', pitch: 'b2', dur: '20' }},
  '( a1.10 | b1.10 )': { tag: 'par', left: { tag: 'note', pitch: 'a1', dur: '10' }, right: { tag: 'note', pitch: 'b1', dur: '10' } },
  '{a1.10}x5': { tag: 'repeat', count: '5', section: { tag: 'note', pitch: 'a1', dur: '10' } } 
};

var sequences = {
// seq
  'a1.10 b2.20\tC3.30   _.40\td4.50\t': 
    { tag: "seq", 
      left: 
        { tag: "note", pitch: "a1", dur: "10" }, 
      right: 
        { tag: "seq", 
          left: { tag: "note", pitch: "b2", dur: "20" }, 
          right: 
            { tag: "seq", 
              left: { tag: "note", pitch: "c3", dur: "30" }, 
              right: 
                { tag: "seq", 
                  left: { tag: "rest", dur: "40" }, 
                  right: { tag: "note", pitch: "d4", dur: "50" } 
                } 
            }
        }
    },
// notes and par
  '\ta1.10   \t a2.20 (b3.30\t_.40\t|\t\tc5.50\t_.60\t)\t':
  {
    tag: 'seq',
    left: {
       tag: 'note',
       pitch: 'a1',
       dur: '10'
    },
    right: {
       tag: 'seq',
       left: {
          tag: 'note',
          pitch: 'a2',
          dur: '20'
       },
       right: {
          tag: 'par',
          left: {
             tag: 'seq',
             left: {
                tag: 'note',
                pitch: 'b3',
                dur: '30'
             },
             right: {
                tag: 'rest',
                dur: '40'
             }
          },
          right: {
             tag: 'seq',
             left: {
                tag: 'note',
                pitch: 'c5',
                dur: '50'
             },
             right: {
                tag: 'rest',
                dur: '60'
             }
          }
       }
    }
  },
// par and notes
'\t\t(  _.30  b4.40|_.50 c6.60\t\t)\ta1.10\t\ta2.20':
  {
    tag: 'seq',
    left: {
       tag: 'par',
       left: {
          tag: 'seq',
          left: {
             tag: 'rest',
             dur: '30'
          },
          right: {
             tag: 'note',
             pitch: 'b4',
             dur: '40'
          }
       },
       right: {
          tag: 'seq',
          left: {
             tag: 'rest',
             dur: '50'
          },
          right: {
             tag: 'note',
             pitch: 'c6',
             dur: '60'
          }
       }
    },
    right: {
       tag: 'seq',
       left: {
          tag: 'note',
          pitch: 'a1',
          dur: '10'
       },
       right: {
          tag: 'note',
          pitch: 'a2',
          dur: '20'
       }
    }
  },
// complex with comments and whitespace
'{ ( \t a1.10 \t| {a2.20 \t a3.30}x2 ) \r\n}x5 \t; repeat pars\r\r\n\n _.100  a2.20 ; normal\r\n\r\n( { {\t_.300\t}x3 {\t a4.40\t a5.50 \t}x3 }x2 ;cmt\n\r| { ;cmt\n (\t\t a2.20 a3.30\t| ; cmt\r\n      b4.50\t\t) ;cmt\r\n  }x3 ;cmt\r\n)\t; par repeats':
  {
   tag: 'seq',
   left: {
      tag: 'repeat',
      count: '5',
      section: {
         tag: 'par',
         left: {
            tag: 'note',
            pitch: 'a1',
            dur: '10'
         },
         right: {
            tag: 'repeat',
            count: '2',
            section: {
               tag: 'seq',
               left: {
                  tag: 'note',
                  pitch: 'a2',
                  dur: '20'
               },
               right: {
                  tag: 'note',
                  pitch: 'a3',
                  dur: '30'
               }
            }
         }
      }
   },
   right: {
      tag: 'seq',
      left: {
         tag: 'rest',
         dur: '100'
      },
      right: {
         tag: 'seq',
         left: {
            tag: 'note',
            pitch: 'a2',
            dur: '20'
         },
         right: {
            tag: 'par',
            left: {
               tag: 'repeat',
               count: '2',
               section: {
                  tag: 'seq',
                  left: {
                     tag: 'repeat',
                     count: '3',
                     section: {
                        tag: 'rest',
                        dur: '300'
                     }
                  },
                  right: {
                     tag: 'repeat',
                     count: '3',
                     section: {
                        tag: 'seq',
                        left: {
                           tag: 'note',
                           pitch: 'a4',
                           dur: '40'
                        },
                        right: {
                           tag: 'note',
                           pitch: 'a5',
                           dur: '50'
                        }
                     }
                  }
               }
            },
            right: {
               tag: 'repeat',
               count: '3',
               section: {
                  tag: 'par',
                  left: {
                     tag: 'seq',
                     left: {
                        tag: 'note',
                        pitch: 'a2',
                        dur: '20'
                     },
                     right: {
                        tag: 'note',
                        pitch: 'a3',
                        dur: '30'
                     }
                  },
                  right: {
                     tag: 'note',
                     pitch: 'b4',
                     dur: '50'
                  }
               }
            }
         }
      }
   }
  },
// end
};
  



var pegData = fs.readFileSync(pegDataPath, 'utf-8');
var parse = PEG.buildParser(pegData).parse;


exports.testSimple = function(test) {
  for(var k in simple) {
    test.deepEqual(parse(k), simple[k]);
  }
  test.done();
}

exports.testSequences = function(test) {
  for(var k in sequences) {
    test.deepEqual(parse(k), sequences[k]);
  }
  // change tabs to newlines
  for(var k in sequences) {
    var cr = k.replace('\t','\r');
    var lf = k.replace('\t','\n');
    var crlf = k.replace('\t','\r\n');
    test.deepEqual(parse(cr), sequences[k]);
    test.deepEqual(parse(lf), sequences[k]);
    test.deepEqual(parse(crlf), sequences[k]);
  }
  test.done();
}