/**
 * Romanized to Nepali Unicode conversion
 * Handles romanized Nepali input and converts to Unicode
 */

// Comprehensive mapping for romanized Nepali to Unicode
const romanToNepaliMap = {
  // Consonant clusters (highest priority)
  'kh': 'ख',
  'gh': 'घ',
  'ch': 'च',
  'chh': 'छ',
  'jh': 'झ',
  'th': 'ठ',
  'dh': 'ढ',
  'ph': 'फ',
  'bh': 'भ',
  'sh': 'श',
  'ng': 'ङ',
  
  // Main consonants
  'k': 'क',
  'g': 'ग',
  'j': 'ज',
  't': 'ट',
  'd': 'ड',
  'n': 'न',
  'p': 'प',
  'b': 'ब',
  'm': 'म',
  'y': 'य',
  'r': 'र',
  'l': 'ल',
  'w': 'व',
  's': 'स',
  'h': 'ह',
  'c': 'च',
  
  // Vowels
  'a': 'अ',
  'aa': 'आ',
  'i': 'इ',
  'ii': 'ई',
  'u': 'उ',
  'uu': 'ऊ',
  'e': 'ए',
  'ai': 'ऐ',
  'o': 'ओ',
  'au': 'औ',
  
  // Numbers
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

/**
 * Converts romanized Nepali text to Nepali Unicode
 * Attempts to convert as much as possible, leaving unmapped characters as-is
 */
export function convertToNepaliUnicode(text) {
  if (!text) return text;

  let result = '';
  let i = 0;

  while (i < text.length) {
    let matched = false;

    // Try matching 2-character combos first (like "kh", "gh", "ch", "sh", "th", "ph", "bh", "dh", "jh", "aa", "ii", "uu", "ai", "au")
    if (i + 1 < text.length) {
      const twoChar = text.substring(i, i + 2).toLowerCase();
      if (romanToNepaliMap[twoChar]) {
        result += romanToNepaliMap[twoChar];
        i += 2;
        matched = true;
      }
    }

    // If no 2-char match, try single character
    if (!matched) {
      const oneChar = text[i].toLowerCase();
      if (romanToNepaliMap[oneChar]) {
        result += romanToNepaliMap[oneChar];
        i++;
        matched = true;
      }
    }

    // If still no match, keep the original character
    if (!matched) {
      result += text[i];
      i++;
    }
  }

  return result;
}
