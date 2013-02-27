

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("component-to-function/index.js", function(exports, require, module){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

});
require.register("component-find/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Find the first value in `arr` with when `fn(val, i)` is truthy.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  // callback
  if ('function' != typeof fn) {
    if (Object(fn) === fn) fn = objectToFunction(fn);
    else fn = toFunction(fn);
  }

  // filter
  for (var i = 0, len = arr.length; i < len; ++i) {
    if (fn(arr[i], i)) return arr[i];
  }
};

/**
 * Convert `obj` into a match function.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  return function(o){
    for (var key in obj) {
      if (o[key] != obj[key]) return false;
    }
    return true;
  }
}
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("autosuggest/autosuggest.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var bind = require('bind');
var find = require('find');
var events = require('event');

/**
 * Module exports.
 */

module.exports = Autosuggest;

/**
 * Creates an `Autosuggest` instance.
 *
 * @api public
 */

function Autosuggest (el, suggestions) {
  if (!(this instanceof Autosuggest)) return new Autosuggest(el, suggestions);

  // store the input DOM element
  this.el = el;

  // set the suggestions array
  this.set(suggestions);

  // bind event listeners
  this.oninput = bind(this, this.oninput);
  this.onkeydown = bind(this, this.onkeydown);
  this.bind();
}

/**
 * Gets the current `suggestions` array.
 *
 * @return {Array} the array of suggestions or `undefined` if none is set.
 * @api public
 */

Autosuggest.prototype.get = function () {
  return this.suggestions;
};

/**
 * Sets the current `suggestions` array to `v`.
 *
 * @param {Array} v array of string suggestions
 * @api public
 */

Autosuggest.prototype.set = function (v) {
  return this.suggestions = v;
};

/**
 * Binds the event listeners to the <input> DOM element.
 *
 * @api public
 */

Autosuggest.prototype.bind = function () {
  events.bind(this.el, 'input', this.oninput);
  events.bind(this.el, 'keydown', this.onkeydown);
};

/**
 * Unbinds the event listers from the <input> DOM element.
 *
 * @api public
 */

Autosuggest.prototype.unbind = function () {
  events.unbind(this.el, 'input', this.oninput);
  events.unbind(this.el, 'keydown', this.onkeydown);
};

/**
 * Called for the <input> DOM element's `"keydown"` event.
 * Checks if the key is one of the blacklisted keys which we should *not*
 * autosuggest when the input value changes.
 *
 * @param {Event} e
 * @api private
 */

Autosuggest.prototype.onkeydown = function (e) {
  var code = e.keyCode;
  this.ignore = 8 == code; // ignore backspace
};

/**
 * Called for the <input> DOM element's `"input"` event.
 * Updates the autosuggestion based on the input's new `value`.
 *
 * @param {Event} e
 * @api private
 */

Autosuggest.prototype.oninput = function () {
  if (this.ignore) return; // user is pressing a key that we don't want to react

  // get current string value
  var value = this.el.value;

  if (0 == value.length) return; // don't suggest if there's nothing there

  var suggestions = this.get();
  if (!suggestions || 0 == suggestions.length) return; // nothing to do...

  // attempt to find a suggestion
  var suggestion = this.suggestion(value, suggestions);
  if (null == suggestion) return; // got nothing...

  // we got a suggestion, set it as the input's new value
  this.el.value = suggestion;

  // select the "suggested" text portion
  var self = this;
  var start = value.length;
  var length = suggestion.length;

  // selecting the text needs to happen in a new tick... :(
  // https://code.google.com/p/chromium/issues/detail?id=32865
  // http://stackoverflow.com/questions/11723420/chrome-setselectionrange-not-work-in-oninput-handler
  clearTimeout(this._timeout);
  this._timeout = setTimeout(function(){
    if (self.el.createTextRange) {
      // use text ranges for Internet Explorer
      var range = self.el.createTextRange();
      range.moveStart('character', start);
      range.moveEnd('character', length - self.el.value.length);
      range.select();
    } else if (self.el.setSelectionRange) {
      // use setSelectionRange() for Mozilla/WebKit
      self.el.setSelectionRange(start, length);
    }

    // set focus back to the el
    self.el.focus();
  }, 0);
};

/**
 * Returns a single suggestion based on the `value` string and from the array of
 * `suggestions`.
 *
 * @api private
 */

Autosuggest.prototype.suggestion = function (value, suggestions) {
  var val = value.toLowerCase();
  return find(suggestions, function (suggestion) {
    return suggestion.toLowerCase().substring(0, val.length) == val;
  });
};

});
require.alias("component-bind/index.js", "autosuggest/deps/bind/index.js");

require.alias("component-find/index.js", "autosuggest/deps/find/index.js");
require.alias("component-to-function/index.js", "component-find/deps/to-function/index.js");

require.alias("component-event/index.js", "autosuggest/deps/event/index.js");

require.alias("autosuggest/autosuggest.js", "autosuggest/index.js");

