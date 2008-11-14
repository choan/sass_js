Sass.tree.Node = function(options) {
  this.options = options || {};
  this.style = this.options.style;
  this.children = [];
};

var stn = Sass.tree.Node.prototype;

stn.toString = function() {
  var result = '', child, i;
  for (i = 0; i < this.length; i += 1) {
    child = this[i];
    if (false) {  // TODO lanzar excepción si es un atributo
    }
    else {
      result += child.toString(1);
    }
  }
  return this.style == 'compressed' ? result + '\n' : result.replace(/.$/, '');
};

stn.append = function(child) {
  // TODO controlar si el hijo es valido
  if (msg = this.isInvalidChild(child)) {
    throw msg;
  }
  this.children.push(child);
  this.length = this.children.length;
  this[this.length - 1] = this.children[this.length - 1];
};

stn.isInvalidChild = function(child) {
  return false;
};

