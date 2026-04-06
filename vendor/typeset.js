// Lightweight typeset: smart quotes + hanging punctuation
(function () {
  var IGNORE = 'head,code,pre,script,style,img,br,hr,iframe';

  var DOUBLE_OPEN  = ['"', '\u201c'];
  var SINGLE_OPEN  = ["'", '\u2018'];

  function smartQuotes(text) {
    return text
      .replace(/(\W|^)"([^\s])/g,   '$1\u201c$2')
      .replace(/"/g,                 '\u201d')
      .replace(/(\W|^)'([^\s])/g,   '$1\u2018$2')
      .replace(/([a-z])'([a-z])/gi, '$1\u2019$2')
      .replace(/'/g,                 '\u2019');
  }

  function startsWithAny(str, list) {
    for (var i = 0; i < list.length; i++) {
      if (str.indexOf(list[i]) === 0) return list[i];
    }
    return null;
  }

  function hangingPunct(text) {
    var trimmed = text.replace(/^\s+/, '');
    var leading = text.slice(0, text.length - trimmed.length);
    var match;
    if ((match = startsWithAny(trimmed, DOUBLE_OPEN))) {
      return leading + '<span class="pull-double">' + match + '</span>' + trimmed.slice(match.length);
    }
    if ((match = startsWithAny(trimmed, SINGLE_OPEN))) {
      return leading + '<span class="pull-single">' + match + '</span>' + trimmed.slice(match.length);
    }
    return text;
  }

  var BLOCK_RE = /^(P|LI|BLOCKQUOTE|H[1-6]|TD|TH)$/;

  function isLineStart(node) {
    // First text node in a block element
    var block = node.parentNode;
    while (block && !BLOCK_RE.test(block.nodeName)) block = block.parentNode;
    if (!block) return false;
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    if (walker.nextNode() === node) return true;
    // Or immediately follows a <br>
    var prev = node.previousSibling;
    while (prev && prev.nodeType === 3 && !prev.data.trim()) prev = prev.previousSibling;
    return !!(prev && prev.nodeName === 'BR');
  }

  function replaceTextNode(node, html) {
    var parent = node.parentNode;
    if (!parent) return;
    var temp = document.createElement('span');
    temp.innerHTML = html;
    while (temp.firstChild) parent.insertBefore(temp.firstChild, node);
    parent.removeChild(node);
  }

  function processNode(node) {
    if (node.nodeType === 1) {
      if (node.matches && node.matches(IGNORE)) return;
      Array.from(node.childNodes).forEach(processNode);
    } else if (node.nodeType === 3) {
      var text = node.data;
      if (!text.trim()) return;
      var result = smartQuotes(text);
      var first = isLineStart(node);
      if (first) {
        console.log('first-in-block:', JSON.stringify(text.slice(0, 40)));
        result = hangingPunct(result);
        console.log('after hang:', result.slice(0, 60));
      }
      if (result !== text) replaceTextNode(node, result);
    }
  }

  window.typeset = function (selector) {
    var root = document.querySelector(selector || '#main-content');
    if (!root) return;
    Array.from(root.childNodes).forEach(processNode);
  };
})();
