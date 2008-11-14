Sass.utils = {
  
  scan : function(s, regexp, cb) {
    var ret, match;
    
    if (!cb) {
      ret = [];
      cb = function(a) {
        ret.push(a);
      };
    }

    while (s.length > 0) {
      if (match = s.match(regexp)) {
        s = s.slice(match.index + match[0].length);
        if (match[1]) {
          cb(match.slice(1));
        }
        else {
          cb(match[0]);
        }
      }
      else {
        s = '';
      }
    }

    return ret;
    
  },
  
  repeat : function(s, times) {
    var o = '';
    for (var i = times; i > 0; i -= 1)  {
      o += s;
    }
    return o;
  },
  
  extend : function(subc, superc) {
    var F = function() {};
    F.prototype = superc.prototype;
    subc.prototype = new F();
    subc.superclass = superc;
    if (superc.prototype.constructor == Object.prototype.constructor) superc.prototype.constructor = superc;
    subc.prototype.constructor = subc;
  },
  
  isA : function isA(obj, superc) {
    if (obj == superc) {
      return true;
    }
    if (obj.constructor == superc) {
      return true;
    }
    if (obj.constructor.superclass) {
      return isA(obj.constructor, superc);
    }
    if (obj.superclass) {
      return isA(obj.superclass, superc);
    }
    return false;
  }
    
};