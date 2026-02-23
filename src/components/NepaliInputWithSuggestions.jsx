import React, { useState, useRef, useEffect } from 'react';
import { getNepaliSuggestions } from '../utils/nepaliDictionary';
import { cn } from '../utils/cn';

/**
 * NepaliInputWithSuggestions - Input field with Nepali word suggestions
 * Similar to Google Input Tools - shows suggestions as you type
 */
const NepaliInputWithSuggestions = ({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = 'Type here...',
  isTextarea = false,
  className = '',
  isNepaliMode = false,
  enableUnicodeHelper = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentWord, setCurrentWord] = useState('');
  const [showUnicodeHelper, setShowUnicodeHelper] = useState(false);
  const [unicodeHelperText, setUnicodeHelperText] = useState('');
  const [clipboardError, setClipboardError] = useState('');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Get suggestions only if in Nepali mode
    if (isNepaliMode) {
      const lastWord = getLastWord(newValue);
      setCurrentWord(lastWord);

      if (lastWord && lastWord.length > 0) {
        const sugg = getNepaliSuggestions(lastWord);
        setSuggestions(sugg);
        setShowSuggestions(sugg.length > 0);
        setSelectedIndex(-1);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }
  };

  const getLastWord = (text) => {
    const words = text.split(/\s+/);
    return words[words.length - 1] || '';
  };

  const getTextBeforeLastWord = (text) => {
    const lastSpaceIndex = text.lastIndexOf(' ');
    if (lastSpaceIndex === -1) return '';
    return text.substring(0, lastSpaceIndex + 1);
  };

  const handleSuggestionClick = (suggestion) => {
    const textBefore = getTextBeforeLastWord(value);
    const newValue = textBefore + suggestion;
    onChange(newValue);
    onSuggestionSelect?.(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentWord('');
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && isNepaliMode) {
        // Auto-select first suggestion on Enter if available
        const lastWord = getLastWord(value);
        const sugg = getNepaliSuggestions(lastWord);
        if (sugg.length > 0) {
          e.preventDefault();
          handleSuggestionClick(sugg[0]);
          return;
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSuggestionClick(suggestions[0]);
        }
        break;
      case ' ':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions.length > 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
          // Add space after
          setTimeout(() => {
            const textBefore = getTextBeforeLastWord(value);
            const selectedSuggestion = suggestions[selectedIndex];
            onChange(textBefore + selectedSuggestion + ' ');
          }, 0);
        } else if (suggestions.length > 0) {
          handleSuggestionClick(suggestions[0]);
          setTimeout(() => {
            const textBefore = getTextBeforeLastWord(value);
            onChange(textBefore + suggestions[0] + ' ');
          }, 0);
        } else {
          // Just add space normally
          onChange(value + ' ');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all font-nepali',
          isTextarea && 'min-h-[100px] resize-none',
          className
        )}
      />

      {enableUnicodeHelper && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowUnicodeHelper((prev) => !prev)}
            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {showUnicodeHelper ? 'Hide Unicode Tool' : 'Open Unicode Tool'}
          </button>
        </div>
      )}

      {enableUnicodeHelper && showUnicodeHelper && (
        <div className="mt-2 border border-slate-200 rounded-lg p-2 bg-white space-y-2">
          <p className="text-[11px] text-slate-600">
            Google Input Tools flow: open Google tool, type Romanized Nepali there, copy Unicode text, then click Apply From Clipboard.
          </p>
          <button
            type="button"
            onClick={() => {
              window.open('https://www.google.com/intl/ne/inputtools/try/', '_blank', 'noopener,noreferrer');
            }}
            className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
          >
            Open Google Input Tools
          </button>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Fallback: paste Nepali Unicode
            </label>
            <textarea
              value={unicodeHelperText}
              onChange={(e) => setUnicodeHelperText(e.target.value)}
              placeholder="Paste converted Unicode text here..."
              className="w-full p-2 border border-slate-200 rounded text-sm min-h-[70px] font-nepali"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (!text) {
                    setClipboardError('Clipboard is empty.');
                    return;
                  }
                  setClipboardError('');
                  onChange(text);
                  setShowUnicodeHelper(false);
                } catch {
                  setClipboardError('Clipboard access was blocked. Use the manual box below.');
                }
              }}
              className="px-3 py-1.5 rounded bg-brand-600 text-white text-xs hover:bg-brand-700"
            >
              Apply From Clipboard
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(unicodeHelperText);
                setClipboardError('');
                setShowUnicodeHelper(false);
              }}
              className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
            >
              Apply Pasted Text
            </button>
          </div>
          {clipboardError && (
            <p className="text-[11px] text-red-600">{clipboardError}</p>
          )}
        </div>
      )}

      {/* Suggestions Dropdown - Similar to Google Input Tools */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto min-w-max"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full text-left px-4 py-3 text-sm transition-colors font-nepali whitespace-nowrap',
                selectedIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-slate-100 text-slate-800 border-b border-slate-100 last:border-b-0'
              )}
              title={`Press ${index + 1} or click to select`}
            >
              <div className="flex justify-between items-center gap-4">
                <span className="font-medium text-base">{suggestion}</span>
                <span className="text-xs ml-auto opacity-60">
                  {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Help text */}
      {isNepaliMode && currentWord && (
        <div className="text-xs text-slate-500 mt-1">
          Press <kbd className="px-1 py-0.5 bg-slate-100 rounded">↓↑</kbd> to navigate,{' '}
          <kbd className="px-1 py-0.5 bg-slate-100 rounded">Enter</kbd> to select
        </div>
      )}
    </div>
  );
};

export default NepaliInputWithSuggestions;
