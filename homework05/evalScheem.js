/*
  Interpreter for Scheem code
  ===========================
  usage examples:
    var environment = EvalScheem.getInitialEnvironment();
    EvalScheem.eval(['parsed',['scheem','tree']], environment);
    EvalScheem.parseAndEval('(raw (scheem code))', environment);
    ... catch(e) { if (e instanceof EvalScheem.InterpreterError) { log(e.message); } }
*/


EvalScheem = (function() {
  
  function InterpreterError(message) {
    this.name = 'InterpreterError';
    this.message = message;
  }
  InterpreterError.prototype = Error.prototype;
  
  // helper validators for number of required parameters
  
  var requiredParams = function(expr,numParams) {
    if(expr.length != numParams+1) throw new InterpreterError('required number of parameters for "' + expr[0] + '" is ' + numParams + ', got ' + (expr.length-1) + "");
  }

  var minParams = function(expr,numParams) {
    if(expr.length < numParams+1) throw new InterpreterError('minimum number of parameters for "'+ expr[0] + '" is ' + numParams + ', got ' + (expr.length-1) + "");
  }
  
  
  var isArray = function(obj) {
    if(Array.isArray) return Array.isArray(obj);
    if(Object.prototype.toString.call(obj) === '[object Array]' ) return true; else return false;
  }
  
  // helper for functions that take two numbers, returns function with included parameter validation
  var binaryNumeric = function(fname, func) {
    return function(a,b) {
      if(arguments.length !== 2) throw new InterpreterError('function "' + fname + '" takes two arguments, got ' + arguments.length + "");
      if(typeof a !== 'number') throw new InterpreterError('first argument of "' + fname + '" must be a number, got ' + typeof a + ' "' + a + '"');
      if(typeof b !== 'number') throw new InterpreterError('second argument of "' + fname + '" must be a number, got ' + typeof b + ' "' + b + '"');
      return func(a, b);
    };
  }
  
  // standard procedures
  
  var cons = function() {
    if(arguments.length !== 2) throw new InterpreterError('function "cons" takes two arguments, got ' + arguments.length + "");
    var x = arguments[0];
    var xs = arguments[1];
    //if(!isArray(xs)) throw new InterpreterError('evaluated "cons" argument must be a list, got "' + xs + '"');
    return [x].concat(xs);
  }
  
  var car = function() {
    if(arguments.length !== 1) throw new InterpreterError('function "car" takes one argument, got ' + arguments.length + "");
    var xs = arguments[0];
    if(!isArray(xs)) throw new InterpreterError('evaluated "car" argument must be a list, got "' + xs + '"');
    if(xs.length == 0) throw new InterpreterError('cannot "car" on empty list');
    return xs[0];
  }
  
  var cdr = function() {
    if(arguments.length !== 1) throw new InterpreterError('function "cdr" takes one argument, got ' + arguments.length + "");
    var xs = arguments[0];
    if(!isArray(xs)) throw new InterpreterError('evaluated "cdr" argument must be a list, got "' + xs + '"');
    if(xs.length == 0) throw new InterpreterError('cannot "cdr" on empty list');
    return xs.slice(1,xs.length);
  }
  
  var isList = function() {
    if(arguments.length !== 1) throw new InterpreterError('function "list?" takes one argument, got ' + arguments.length + "");
    var l = arguments[0];
    return isArray(l) ? '#t' : '#f';
  }
  
  var listLength = function() {
    if(arguments.length !== 1) throw new InterpreterError('function "length" takes one argument, got ' + arguments.length + "");
    var l = arguments[0];
    if(!isArray(l)) throw new InterpreterError('argument of "length" must be a list, got ' + typeof l + ': ' + l);
    return l.length;
  }
  
  var isNull = function() {
    if(arguments.length !== 1) throw new InterpreterError('function "null?" takes one argument, got ' + arguments.length + "");
    var l = arguments[0];
    if(!isArray(l)) return '#f';
    return l.length == 0 ? '#t' : '#f' ;
  }
  
  // predefined environment to be added to every passed environment at the time of execution
  var predefEnvironment = {
      '+': binaryNumeric('+', function(a, b) { return a+b; }),
      '-': binaryNumeric('-', function(a, b) { return a-b; }),
      '*': binaryNumeric('*', function(a, b) { return a*b; }),
      '/': binaryNumeric('/', function(a, b) { return a/b; }),
      '=': binaryNumeric('=', function(a, b) { return a==b ? '#t' : '#f'; }),
      '<': binaryNumeric('<', function(a, b) { return a<b ?  '#t' : '#f'; }),
      'cons': cons,
      'car': car,
      'cdr': cdr,
      'alert': alert,
      'length': listLength,
      'null?': isNull,
      'list?': isList,
  };
  
  // look up a variable in environment
  // environment format is { bindings: { var1: value, var2: value }, outer: envObject }
  var lookup = function(v, env) {
    if(!env.hasOwnProperty('bindings')) {
      if(predefEnvironment.hasOwnProperty(v)) return predefEnvironment[v];
      else throw new InterpreterError('variable "' + v + '" not found');
    }
    else if(env.bindings.hasOwnProperty(v)) return env.bindings[v];
    else if(env.hasOwnProperty('outer')) return lookup(v, env.outer);
    else throw new InterpreterError('environment doesn\'t have property "outer" - this shouldn\'t happen, ever');
  }

  // update existing variable to new value
  var update = function(v, newval, env) {
    if(!env.hasOwnProperty('bindings')) throw new InterpreterError('cannot update variable "' + v + '", variable not defined');
    else if(env.bindings.hasOwnProperty(v)) env.bindings[v] = newval;
    else if(env.hasOwnProperty('outer')) update(v, newval, env.outer);
    else throw new InterpreterError('cannot update variable, environment doesn\'t have property "outer" - this shouldn\'t happen, ever');
  }

  // bind new variable into new environment and return new environment
  var bind = function(v, newval, env) {
    if(!env.hasOwnProperty('bindings')) { // make sure env is properly formatted
      env.bindings = {};
      if(!env.hasOwnProperty('outer')) env.outer = {};
    }
    var newEnv = { bindings: {}, outer: env }; // create local environment for binding
    newEnv.bindings[v] = newval;
    return newEnv;
  }

  // bind multiple key-value pairs into new environment
  var bindMultiple = function(varPairs, env) {
    if(!env.hasOwnProperty('bindings')) { // make sure env is properly formatted
      env.bindings = {};
      if(!env.hasOwnProperty('outer')) env.outer = {};
    }
    var newEnv = { bindings: {}, outer: env }; // create local environment for binding
    for(var i=0; i<varPairs.length; i++) {
      var varName = varPairs[i][0];
      if(newEnv.bindings.hasOwnProperty(varName)) throw new InterpreterError('variable "'+ varName +'"already bound');
      var varValue = evalScheem(varPairs[i][1], env);
      newEnv.bindings[varName] = varValue;
    }
    return newEnv;
  }
  
  
  ///////////////////////////////////
  //                               //
  //   main interpreter function   //
  //                               //
  ///////////////////////////////////
  var evalScheem = function (expr, env) {
    if (typeof expr === 'number') { // numbers evaluate to themselves
      return expr;
    }
    if (typeof expr === 'string') {
      if(expr === '#t' || expr === '#f') return expr; // strings can stand for true/false value
      return lookup(expr, env); // or for variable reference
    }
    if(expr.length == 0) return [];
    
    // look at head of list for operation
    switch (expr[0]) {
      case 'set!':
        requiredParams(expr,2);
        update(expr[1], evalScheem(expr[2], env), env);
        return 0;
      case 'define':
        requiredParams(expr,2);
        if(!env.hasOwnProperty('bindings')) { // make sure env is properly formatted
          env.bindings = {};
          if(!env.hasOwnProperty('outer')) env.outer = {};
        }
        env.bindings[expr[1]] = evalScheem(expr[2], env);
        return 0;
      case 'quote':
        requiredParams(expr,1);
        return expr[1];
      case 'if':
        requiredParams(expr,3);
        var cond = evalScheem(expr[1], env);
        if(cond !== '#t' && cond !== '#f') throw new InterpreterError('"if" condition must evaluate to "#t" or "#f", got "' + cond + '"');
        return (cond === '#t') ? evalScheem(expr[2], env) : evalScheem(expr[3], env);
      case 'begin':
        minParams(expr,1);
        for(var i=1; i<=expr.length-2; i++) {
          evalScheem(expr[i], env);
        }
        return evalScheem(expr[expr.length-1], env);
      case 'let-one':
        requiredParams(expr, 3);
        var newEnv = bind(expr[1], evalScheem(expr[2],env), env);
        return evalScheem(expr[3], newEnv);
      case 'let':
        requiredParams(expr, 2);
        // validate vars
        var pairs = expr[1];
        for(var k in pairs) {
          if(!isArray(pairs[k])) throw new InterpreterError('"let" parameters must be lists, got "' + pairs[k] + '"');
          if(pairs[k].length != 2) throw new InterpreterError('"let" parameters must have two elements, got ' + pairs[k].length + ': ' + pairs[k]);
        }
        var newEnv = bindMultiple(pairs, env);
        return evalScheem(expr[2], newEnv);
      case 'lambda-one':
      case 'lambda':
        requiredParams(expr, 2);
        // validate params
        var p, pairs = [], params = expr[1];
        if(!isArray(params)) params = [params];
        for(var k in params) {
          p = params[k];
          if(typeof p !== 'string' || p === '#t' || p === '#f') throw new InterpreterError('invalid lambda parameter "' + p + '"');
          pairs.push([p,0]);
        }
        var lfn = function() {
          var localEnv = bindMultiple(pairs, env);
          if(arguments.length != params.length) throw new InterpreterError('function expects ' + params.length + ' arguments, got ' + arguments.length);
          for(var i=0; i<arguments.length; i++) {
            update(params[i], arguments[i], localEnv);
          }
          return evalScheem(expr[2], localEnv);
        };
        return lfn;
      default:
        var fn = evalScheem(expr[0], env);
        if(typeof fn !== 'function') throw new InterpreterError('"' + fn + '" is not a function');
        var argvals = [], args = expr.slice(1, expr.length);
        for(var k in args) argvals.push(evalScheem(args[k], env));
        return fn.apply(null, argvals);
    }
  };
  
  // parse raw scheem code
  var parseAndEval = function(scheem, env) {
    return evalScheem(SCHEEM.parse(scheem), env);
  }
  
  var result = {};
  // export for testing
  result.lookup = lookup;
  result.update = update;
  result.bind = bind;
  // export for use
  result.eval = evalScheem;
  result.parseAndEval = parseAndEval;
  result.InterpreterError = InterpreterError;
  return result;
})();