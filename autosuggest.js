
/**
 * Module dependencies.
 */

var bind = require('bind');
var find = require('find');
var events = require('event');
var select = require('select');

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
  this.ignore = 8 == code || 46 == code; // ignore del & backspace
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

  // reference to input el
  var input = this.el;

  // get current string value
  var value = input.value;

  if (0 == value.length) return; // don't suggest if there's nothing there

  var suggestions = this.get();
  if (!suggestions || 0 == suggestions.length) return; // nothing to do...

  // attempt to find a suggestion
  var suggestion = this.suggest(value, suggestions);
  if (null == suggestion) return; // got nothing...

  // we got a suggestion, set it as the input's new value
  input.value = suggestion;

  // determine selection range
  var start = value.length;
  var end = suggestion.length;

  // select the "suggested" text portion

  // selecting the text needs to happen in a new tick... :(
  // because we are in the "oninput" event
  // https://code.google.com/p/chromium/issues/detail?id=32865
  // http://stackoverflow.com/questions/11723420/chrome-setselectionrange-not-work-in-oninput-handler
  setTimeout(function () {
    select(input, start, end);
  }, 0);
};

/**
 * Returns a single suggestion based on the `value` string and from the array of
 * `suggestions`.
 *
 * @api private
 */

Autosuggest.prototype.suggest = function (value, suggestions) {
  var val = value.toLowerCase();
  return find(suggestions, function (suggestion) {
    return suggestion.toLowerCase().substring(0, val.length) == val;
  });
};
