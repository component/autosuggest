
# autosuggest

### Autosuggest values for text inputs

`<input type="text">` autosuggest component. [Try the demo][demo]!

Inspired from http://oak.cs.ucla.edu/cs144/projects/javascript/suggest1.html.

## Installation

```bash
$ component install component/autosuggest
```

## Example

```js
var autosuggest = require('autosuggest');
var input = document.querySelector('input[type="text"]');

// array of suggestions
var suggestions = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// create an `autosuggest` instance
var suggest = autosuggest(input, suggestions);

// and you can change the array of suggestions to use if they get change
var newSuggestions = suggestions.concat([ 'Funday' ]);
suggest.set(newSuggestions);
```

## API

### autosuggest(el, [suggestions]) → Autosuggest

Returns an `Autosuggest` instance. The instance has `.start()` called on it if the
optional `suggestions` array is given, otherwise you must call `.set(array)` and
`.start()` manually.

#### .stop()

Stops the autosuggesting.

## License

  MIT

[demo]: http://component.github.com/autosuggest/
