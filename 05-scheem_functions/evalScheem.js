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
  
  
  // helper for functions that take two numbers
  
  var binaryNumeric = function(arg1, arg2, env, retfun) {
    arg1 = evalScheem(arg1, env);
    if(typeof arg1 !== 'number') throw new InterpreterError('first argument must be a number');
    arg2 = evalScheem(arg2, env);
    if(typeof arg2 !== 'number') throw new InterpreterError('second argument must be a number');
    return retfun(arg1,arg2);
  }

  
  var isArray = function(obj) {
    if(Array.isArray) return Array.isArray(obj);
    if(Object.prototype.toString.call(obj) === '[object Array]' ) return true; else return false;
  }
  
  // look up a variable in environment
  // environment format is { bindings: { var1: value, var2: value }, outer: envObject }
  var lookup = function(v, env) {
    if(!env.hasOwnProperty('bindings')) throw new InterpreterError('variable "' + v + '" not found');
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
  
  
  var getInitialEnvironment = function() {
    return { bindings: {}, outer: {} };
  }
  
  // main interpreter function
  
  var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
      return expr;
    }
    if (typeof expr === 'string') {
      if(expr === '#t' || expr === '#f') return expr;
      return lookup(expr, env);
    }
    // Look at head of list for operation
    switch (expr[0]) {
      case '+':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a+b; });
      case '-':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a-b; });
      case '*':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a*b; });
      case '/':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a/b; });
      case '=':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a===b ? '#t' : '#f'; });
      case '<':
        requiredParams(expr,2);
        return binaryNumeric(expr[1], expr[2], env, function(a,b) { return a<b ? '#t' : '#f'; });
      case 'set!':
        requiredParams(expr,2);
        update(expr[1], evalScheem(expr[2], env), env);
        return 0;
      case 'define':
        requiredParams(expr,2);
        //if(env.bindings[expr[1]] !== undefined) throw new InterpreterError('attempted to redefine variable "' + expr[1] + '"');
        // redefining existing variable is now allowed
        env.bindings[expr[1]] = evalScheem(expr[2], env);
        return 0;
      case 'quote':
        requiredParams(expr,1);
        return expr[1];
      case 'cons':
        requiredParams(expr,2);
        var oldcons = evalScheem(expr[2], env);
        if(!isArray(oldcons)) throw new InterpreterError('evaluated argument must be a list, got "' + oldcons + '"');
        return [evalScheem(expr[1], env)].concat(oldcons);
      case 'car':
        requiredParams(expr,1);
        var tmpcar = evalScheem(expr[1], env)
        if(!isArray(tmpcar)) throw new InterpreterError('evaluated argument must be a list, got "' + tmpcar + '"');
        if(tmpcar.length==0) throw new InterpreterError('car error - list is empty');
        return tmpcar[0];
      case 'cdr':
        requiredParams(expr,1);
        var tmpcdr = evalScheem(expr[1], env);
        if(!isArray(tmpcdr)) throw new InterpreterError('evaluated argument must be a list, got "' + tmpcdr + '"');
        if(tmpcdr.length==0) throw new InterpreterError('cdr error - list is empty');
        return tmpcdr.slice(1, tmpcdr.length);
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
        var localEnv = bindMultiple(pairs, env);
        var lfn = function() {
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
  result.getInitialEnvironment = getInitialEnvironment;
  result.InterpreterError = InterpreterError;
  return result;
})();