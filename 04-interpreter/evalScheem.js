var requiredParams = function(expr,numParams) {
  if(expr.length != numParams+1) throw new Error('required number of parameters for "'+ expr[0] + '" is ' + numParams + ', got ' + expr.length-1);
}

var minParams = function(expr,numParams) {
  if(expr.length < numParams+1) throw new Error('minimum number of parameters for "'+ expr[0] + '" is ' + numParams + ', got ' + expr.length-1);
}

var binaryNumeric = function(arg1, arg2, env, retfun) {
  arg1 = evalScheem(arg1, env);
  if(typeof arg1 !== 'number') throw new Error('first argument must be a number');
  arg2 = evalScheem(arg2, env);
  if(typeof arg2 !== 'number') throw new Error('second argument must be a number');
  return retfun(arg1,arg2);
}

var isArray = function(obj) {
  if(Array.isArray) return Array.isArray(obj);
  if(Object.prototype.toString.call(obj) === '[object Array]' ) return true; else return false;
}

var evalScheem = function (expr, env) {
  // Numbers evaluate to themselves
  if (typeof expr === 'number') {
    return expr;
  }
  if (typeof expr === 'string') {
    if(expr === '#t' || expr === '#f') return expr;
    if(env[expr] === undefined) throw new Error('attempted to access undefined variable "' + expr + '"');
    return env[expr];
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
      if(env[expr[1]] === undefined) throw new Error('attempted to set undefined variable "' + expr[1] + '"');
      env[expr[1]] = evalScheem(expr[2], env);
      return 0;
    case 'define':
      requiredParams(expr,2);
      if(env[expr[1]] !== undefined) throw new Error('attempted to redefine variable "' + expr[1] + '"');
      env[expr[1]] = evalScheem(expr[2], env);
      return 0;
    case 'quote':
      requiredParams(expr,1);
      return expr[1];
    case 'cons':
      requiredParams(expr,2);
      var oldcons = evalScheem(expr[2], env);
      if(!isArray(oldcons)) throw new Error('evaluated argument must be a list, got "' + oldcons + '"');
      return [evalScheem(expr[1], env)].concat(oldcons);
    case 'car':
      requiredParams(expr,1);
      var tmpcar = evalScheem(expr[1], env)
      if(!isArray(tmpcar)) throw new Error('evaluated argument must be a list, got "' + tmpcar + '"');
      if(tmpcar.length==0) throw new Error('car error - list is empty');
      return tmpcar[0];
    case 'cdr':
      requiredParams(expr,1);
      var tmpcdr = evalScheem(expr[1], env);
      if(!isArray(tmpcdr)) throw new Error('evaluated argument must be a list, got "' + tmpcdr + '"');
      if(tmpcdr.length==0) throw new Error('cdr error - list is empty');
      return tmpcdr.slice(1, tmpcdr.length);
    case 'if':
      requiredParams(expr,3);
      var cond = evalScheem(expr[1], env);
      if(cond !== '#t' && cond !== '#f') throw new Error('if condition must evaluate to "#t" or "#f", got "' + cond + '"');
      return (cond === '#t') ? evalScheem(expr[2], env) : evalScheem(expr[3], env);
    case 'begin':
      minParams(expr,1);
      for(var i=1; i<=expr.length-2; i++) {
        evalScheem(expr[i], env);
      }
      return evalScheem(expr[expr.length-1], env);
  }
};

var evalScheemString = function(scheem, env) {
  return evalScheem(SCHEEM.parse(scheem), env);
}