Sass.exception = {};

var exceptions = ['SyntaxError'];

for (var i = 0; i < exceptions.length; i += 1) {
  Sass.exception[exceptions[i]] = function(n) {
    return function(msg, line) {
      return { name: n, message: msg + ' at line ' + line };
    };
  }(exceptions[i]);
}