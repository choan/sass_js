var strsuper = Sass.tree.Node;

var PARENT = '&';

Sass.tree.RuleNode = function(rule, options) {
  this.rule = rule;
  strsuper.call(this, options);
};

Sass.utils.extend(Sass.tree.RuleNode, Sass.tree.Node);

var strpp = Sass.tree.RuleNode.prototype;

strpp.isContinued = function() {
  return this.rule.substr(-1) == ',';
};

strpp.addRules = function(node) {
  this.rule = this.rules();
  var addition = node.rules();
  this.rule = this.rule.concat(addition);
};

strpp.rules = function() {
  return this.rule.constructor == Array ? this.rule : [ this.rule ];
};

strpp.toString = function(tabs, superRules) {
  var attrs = [];
  var subRules = [];
  var ruleSplitter = /\s*,\s*/g;
  var ruleSeparator = ', ';
  var lineSeparator = '\n';
  var ruleIndent = Sass.utils.repeat('  ', tabs - 1);
  var totalRule = '';
  var perRuleIndent;
  var totalIndent;
  var toReturn = '';
  var i, child, selectors;
  if (superRules) {
    // TODO implement multiple parent rules
    totalRule =  [ superRules + ' ' + this.rules() ];
  }
  else if (false) { // TODO raise syntax error if any of the rules contains the & call
  }
  else {
    // TODO implement clean joining of selectors
    perRuleIndent = ruleIndent;
    totalIndent = '';
    selectors = this.rules();
    for (i = 0; i < selectors.length; i += 1) {
      selectors[i] = selectors[i].replace(/,$/, '').replace(ruleSplitter, ruleSeparator).replace(/\s*$/, '');
    }
    totalRule = selectors.join(ruleSeparator);
  }
  
  for (i = 0; i < this.children.length; i += 1) {
    child = this.children[i];
    if (Sass.utils.isA(child, Sass.tree.RuleNode)) {
      subRules.push(child);
    }
    else {
      attrs.push(child);
    }
  }
  
  if (attrs.length) {
    for (i = 0; i < attrs.length; i += 1) { // convert each attribute to a string
      attrs[i] = attrs[i].toString(tabs + 1);
    }
    toReturn += totalRule + ' { ' + attrs.join('') + '}\n';
  }

  for (i = 0; i < subRules.length; i += 1) {
    toReturn += subRules[i].toString(tabs, totalRule);
  }
  
  
  return toReturn;
};