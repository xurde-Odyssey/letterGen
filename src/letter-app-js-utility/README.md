# Nepali Inline Typing Utility

This folder is a framework-independent JavaScript utility for inline Nepali typing in any `input` or `textarea`.

Use it in a letter generator app when you want selected text fields to behave like this:

- user types Romanized Nepali
- after pressing `space`, the previous word changes to Nepali Unicode
- text is replaced inside the same field
- caret position stays correct

## Files

- `branch.js`
- `converter.js`
- `nepali-inline.js`
- `example.html`
- `integration-prompt.md`

## What you need to provide

This folder now includes the transliteration engine from this repo:

- `branch.js`
- `converter.js`

`example.html` uses those two files directly, so the copied folder is self-contained.

You can also connect your own transliteration function if your target app already has a better engine:

```js
function transliterateWord(word) {
  return word;
}
```

Input:

- one Romanized Nepali word

Output:

- the Nepali Unicode version of that word
- if no change is needed, return the original word

## Quick usage

```html
<script src="./branch.js"></script>
<script src="./converter.js"></script>
<script src="./nepali-inline.js"></script>
<script>
  smartConverter(true);

  function transliterateWord(word) {
    return translateWords(word, false).replace(/\s+$/, "");
  }

  NepaliInlineTyping.bind("[data-nepali='true']", {
    transliterateWord: transliterateWord,
  });
</script>
```

## Recommended field marking

```html
<input data-nepali="true" name="recipientName">
<input data-nepali="true" name="officeName">
<textarea data-nepali="true" name="body"></textarea>
```

## Dynamic forms

If your template fields are added later through JavaScript, call:

```js
NepaliInlineTyping.bind(container.querySelectorAll("[data-nepali='true']"), {
  transliterateWord: transliterateWord,
});
```

You can run `bind(...)` again safely. It will skip already-bound fields.

## API

### `NepaliInlineTyping.bind(target, options)`

`target` can be:

- a CSS selector string
- a single DOM element
- a NodeList
- an array of DOM elements

`options`:

- `transliterateWord`: required function
- `triggerCharacters`: optional array, default `[" "]`

## Portable copy

Copy the entire `letter-app-js-utility` folder into your other app, not just `example.html` or `nepali-inline.js`.

### `NepaliInlineTyping.attach(element, options)`

Attach inline Nepali typing to one specific field.

### `NepaliInlineTyping.replacePreviousWord(value, caretPosition, transliterateWord, triggerCharacters)`

Low-level helper if you need custom behavior.
