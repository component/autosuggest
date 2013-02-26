
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
 * @api private
 */

Autosuggest.prototype.bind = function () {
  events.bind(this.el, 'input', this.oninput);
};

/**
 * Unbinds the event listers from the <input> DOM element.
 *
 * @api private
 */

Autosuggest.prototype.unbind = function () {
  events.unbind(this.el, 'input', this.oninput);
};

/**
 * Called for the <input> DOM element's `"input"` event.
 * Updates the autosuggestion based on the input's new `value`.
 *
 * @param {Event} e
 * @api private
 */

Autosuggest.prototype.oninput = function (e) {
  var suggestions = this.get();
  if (!suggestions || 0 == suggestions.length) return; // nothing to do...

  // get current string value
  var value = this.el.value;
  var iLen = value.length;

  // attempt to find a suggestion
  var sSuggestion = this.suggestion(value, suggestions);
  if (null == sSuggestion) return; // got nothing...

  this.el.value = sSuggestion;

  // select the "suggested" text portion
  var iStart = iLen;
  var iLength = sSuggestion.length;
  if (this.el.createTextRange) {
    // use text ranges for Internet Explorer
    var oRange = this.el.createTextRange();
    oRange.moveStart('character', iStart);
    oRange.moveEnd('character', iLength - this.el.value.length);
    oRange.select();
  } else if (this.el.setSelectionRange) {
    // use setSelectionRange() for Mozilla/WebKit
    this.el.setSelectionRange(iStart, iLength);
  }

  // set focus back to the el
  this.el.focus();
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
