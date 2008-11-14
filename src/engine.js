// The character that begins a CSS attribute.
var ATTRIBUTE_CHAR  = ':';

// The character that designates that
// an attribute should be assigned to a SassScript expression.
var SCRIPT_CHAR     = '=';

// The character that designates the beginning of a comment,
// either Sass or CSS.
var COMMENT_CHAR = '/';

// The character that follows the general COMMENT_CHAR and designates a Sass comment,
// which is not output as a CSS comment.
var SASS_COMMENT_CHAR = '/';

// The character that follows the general COMMENT_CHAR and designates a CSS comment,
// which is embedded in the CSS document.
var CSS_COMMENT_CHAR = '*';

// The character used to denote a compiler directive.
var DIRECTIVE_CHAR = '@';

// Designates a non-parsed rule.
var ESCAPE_CHAR    = '\\';

// Designates block as mixin definition rather than CSS rules to output
var MIXIN_DEFINITION_CHAR = '=';

// Includes named mixin declared using MIXIN_DEFINITION_CHAR
var MIXIN_INCLUDE_CHAR    = '+';

// The regex that matches and extracts data from
// attributes of the form <tt>:name attr</tt>.
var ATTRIBUTE = /^:([^\s=:]+)\s*(=?)(?:\s+|$)(.*)/;

// The regex that matches attributes of the form <tt>name: attr</tt>.
var ATTRIBUTE_ALTERNATE_MATCHER = /^[^\s:]+\s*var [=:]('|'$)/;

// The regex that matches and extracts data from
// attributes of the form <tt>name: attr</tt>.
var ATTRIBUTE_ALTERNATE = /^([^\s=:]+)(\s*=|:)(?:\s+|$)(.*)/;

 
Sass.Engine = function(template, options) {
  this.template = template;
};

var sepp = Sass.Engine.prototype;


sepp.render = function() {
  var tree = renderToTree.call(this);
  // TODO implement environment
  return tree.toString();
};

function renderToTree() {
  var root = new Sass.tree.Node(this.options);
  appendChildren(root, tree(tabulate(this.template))[0], true);
  return root;
}


function Line(text, tabs, index, children) {
  this.text = text.replace(/^\s+|\s+$/g, '');
  this.tabs = tabs;
  this.index = index;
  this.children = children || [];
}


function tabulate(input) {
  var tabStr = null;
  var first = true;
  var ret = [];
  var i, j, line, lineTabStr, tabStr, lineTabs;
  input = input.split(/\r|\n|\r\n/);
  for (i = 0; i < input.length; i += 1) {
    j = i + 1;
    line = input[i];
    if (line.search(/^\s*$/) != -1) continue;
    lineTabStr = line.match(/^\s*/);
    lineTabStr = lineTabStr && lineTabStr[0];
    if (lineTabStr.length !== 0) {
      if (tabStr === null) tabStr = lineTabStr;
      // TODO controlar sangrado al principio del doc
      // TODO controlar mezcla de espacios y tabulaciones
    }
    first = first && !!tabStr;
    if (tabStr === null) {
      ret.push(new Line(line, 0, j));
      continue;
    }
    lineTabs = lineTabStr.length / tabStr.length;
    
    // TODO controlar nivel de sangrado
    ret.push(new Line(line, lineTabs, j));
  }
  return ret;
}

function tree(arr, i) {
  if (i === undefined) i = 0;
  var base = arr[i].tabs;
  var nodes = [];
  var line;
  var subt;
  while ((line = arr[i]) && line.tabs >= base) {
    if (line.tabs > base) {
      if (line.tabs > base + 1) {
        // TODO better error
        // throw "Bad indentation";
      }
      subt = tree(arr, i);
      nodes[nodes.length - 1].children = subt[0];
      i = subt[1];
    }
    else {
      nodes.push(line);
      i += 1;
    }
  }
  return [ nodes, i ];
}

function buildTree(parent, line, root) {
  this.line = line.index;
  var node = parseLine(parent, line, root);
  if (false) { // FIXME if it's non outputting, like a variable assignment
    return node;
  }
  
  node.line = line.index;

  if (!(false)) { // FIXME if it's not a comment node
    appendChildren(node, line.children, false);
  }
  else {
    node.children = line.children;
  }
  return node;
}

function appendChildren(parent, children, root) {
  var continuedRule = null, i, line, child, temp;
  for (i = 0; i < children.length; i += 1) {
    line = children[i];
    child = buildTree(parent, line, root);
    if (Sass.utils.isA(child, Sass.tree.RuleNode) && child.isContinued()) {
      // TODO continued selectors
      if (continuedRule) {
        continuedRule.addRules(child);
      }
      else {
        continuedRule = child;
      }
      continue;
    }
    if (continuedRule) {
      // TODO raise if ends in comma and is not a RuleNode
      continuedRule.addRules(child);
      continuedRule.children = child.children;
      temp = continuedRule;
      continuedRule = null;
      child = temp;
    }
    validateAndAppendChild(parent, child, line, root);
  }
  return parent;  
}

function validateAndAppendChild(parent, child, line, root) {
  var i;
  if (!root) {
    // TODO raise if child is a mixin or an import directive
  }
  if (child.constructor == Array) {
    for (i = 0; i < child.length; i += 1) {
      validateAndAppendChild(parent, child[i], line, root);
    }
  }
  else if (Sass.utils.isA(child, Sass.tree.Node)) {
    parent.append(child);
  }
}

function parseLine(parent, line, root) {
  var start = line.text[0];
  switch (start) {
    case ATTRIBUTE_CHAR:
      return parseAttribute.call(this, line.text);
    case Sass.Script.VARIABLE_CHAR:
    case COMMENT_CHAR:
    case DIRECTIVE_CHAR:
    case MIXIN_DEFINITION_CHAR:
    case MIXIN_INCLUDE_CHAR:
      break;
    default:
      return new Sass.tree.RuleNode(line.text, this.options);
      break;
  }
  
}


function parseAttribute(line, regex) {
  var m, name, eq, value, expr;
  regex = regex || ATTRIBUTE;
  m = line.match(regex);
  name = m[1];
  eq   = m[2];
  value = m[3];

  if (!name || value === undefined) {
    throw Sass.exception.SyntaxError('Invalid attribute: "' + line + '".', this.line);
  }
  
  expr = eq.replace(/\s/g, '') == SCRIPT_CHAR ? Sass.Script.parse(value, this.line) : value;
  return new Sass.tree.AttrNode(name, expr, this.options);
}