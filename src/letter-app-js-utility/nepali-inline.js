(function (global) {
  var BOUND_FLAG = "__nepaliInlineBound";

  function normalizeTriggerCharacters(triggerCharacters) {
    if (!Array.isArray(triggerCharacters) || triggerCharacters.length === 0) {
      return [" "];
    }

    return triggerCharacters;
  }

  function isBoundaryCharacter(character) {
    return (
      character === " " ||
      character === "\n" ||
      character === "\t" ||
      character === "" ||
      typeof character === "undefined"
    );
  }

  function isTriggerCharacter(character, triggerCharacters) {
    return triggerCharacters.indexOf(character) !== -1;
  }

  function replacePreviousWord(
    value,
    caretPosition,
    transliterateWord,
    triggerCharacters
  ) {
    var normalizedTriggers = normalizeTriggerCharacters(triggerCharacters);
    var boundaryIndex;
    var boundaryCharacter;
    var wordStart;
    var token;
    var converted;
    var nextValue;
    var nextCaretPosition;

    if (typeof caretPosition !== "number" || caretPosition <= 0) {
      return {
        value: value,
        caretPosition: caretPosition,
        changed: false,
      };
    }

    boundaryIndex = caretPosition - 1;
    boundaryCharacter = value.charAt(boundaryIndex);

    if (!isTriggerCharacter(boundaryCharacter, normalizedTriggers)) {
      return {
        value: value,
        caretPosition: caretPosition,
        changed: false,
      };
    }

    wordStart = boundaryIndex - 1;
    while (wordStart >= 0 && !isBoundaryCharacter(value.charAt(wordStart))) {
      wordStart--;
    }

    token = value.substring(wordStart + 1, boundaryIndex);
    if (!token.length) {
      return {
        value: value,
        caretPosition: caretPosition,
        changed: false,
      };
    }

    converted = String(transliterateWord(token) || token).replace(/\s+$/, "");
    if (!converted.length || converted === token) {
      return {
        value: value,
        caretPosition: caretPosition,
        changed: false,
      };
    }

    nextValue =
      value.substring(0, wordStart + 1) +
      converted +
      value.substring(boundaryIndex);
    nextCaretPosition = boundaryIndex - token.length + converted.length;

    return {
      value: nextValue,
      caretPosition: nextCaretPosition,
      changed: true,
    };
  }

  function createHandler(element, options) {
    var transliterateWord = options.transliterateWord;
    var triggerCharacters = normalizeTriggerCharacters(
      options.triggerCharacters
    );

    return function handleInput(event) {
      var result = replacePreviousWord(
        element.value,
        element.selectionStart,
        transliterateWord,
        triggerCharacters
      );

      if (!result.changed) {
        return;
      }

      element.value = result.value;
      if (typeof element.setSelectionRange === "function") {
        element.setSelectionRange(result.caretPosition, result.caretPosition);
      }

      if (typeof options.onConverted === "function") {
        options.onConverted({
          element: element,
          value: result.value,
          caretPosition: result.caretPosition,
          event: event,
        });
      }
    };
  }

  function isTextField(element) {
    if (!element || !element.tagName) {
      return false;
    }

    return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
  }

  function attach(element, options) {
    var handler;

    if (!isTextField(element)) {
      return null;
    }

    if (!options || typeof options.transliterateWord !== "function") {
      throw new Error(
        "NepaliInlineTyping.attach requires options.transliterateWord"
      );
    }

    if (element[BOUND_FLAG]) {
      return element[BOUND_FLAG];
    }

    handler = createHandler(element, options);
    element.addEventListener("input", handler);

    element[BOUND_FLAG] = {
      destroy: function destroy() {
        element.removeEventListener("input", handler);
        element[BOUND_FLAG] = null;
      },
    };

    return element[BOUND_FLAG];
  }

  function toElements(target) {
    if (typeof target === "string") {
      return Array.prototype.slice.call(document.querySelectorAll(target));
    }

    if (!target) {
      return [];
    }

    if (target.tagName) {
      return [target];
    }

    return Array.prototype.slice.call(target);
  }

  function bind(target, options) {
    var elements = toElements(target);
    var bindings = [];
    var i;

    for (i = 0; i < elements.length; i++) {
      if (isTextField(elements[i])) {
        bindings.push(attach(elements[i], options));
      }
    }

    return bindings;
  }

  global.NepaliInlineTyping = {
    attach: attach,
    bind: bind,
    replacePreviousWord: replacePreviousWord,
  };
})(window);

