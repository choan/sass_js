var stasuper = Sass.tree.Node;

Sass.tree.AttrNode = function(name, value, options) {
  this.name = name;
  this.value = value;
  stasuper.call(this, options);
};

Sass.utils.extend(Sass.tree.AttrNode, Sass.tree.Node);

var stapp = Sass.tree.AttrNode.prototype;

stapp.isInvalidChild = function(child) {
  if (!(child instanceof Sass.tree.AttrNode)) {
    throw Sass.exception.SyntaxError('Illegal nesting: Only attributes may be nested beneath attributes');
  }
};

stapp.toString = function(tabs, parentName) {
  // TODO raise if this.value ends with ;
  // debugger;
  var realName = this.name, joinString, spaces, toReturn, i;
  if (parentName) {
    realName = parentName + '-' + realName;
  }
  // TODO raise if value if empty or there are no children
  joinString = ' ';
  spaces = Sass.utils.repeat('  ', tabs - 1);
  toReturn = ''
  if (this.value) { // TODO insert spaces before realName when in not compressed mode
    toReturn += realName + ': ' + this.value + ';' + joinString;
  }
  for (var i = 0; i < this.children.length; i += 1) {
    kid = this.children[i];
    toReturn += kid.toString(tabs, realName);
  }
  return toReturn;
};