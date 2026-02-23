/**
 * Manual test for the new Nepali converter
 */

const romanToNepaliMap = {
  // First-priority: consonant clusters
  'ksh': 'क्ष',
  'tra': 'त्र',
  'gya': 'ज्ञ',
  'chh': 'छ',
  'jha': 'झ',
  'dha': 'ढ',
  'pha': 'फ',
  'bha': 'भ',
  'tha': 'ठ',
  'kha': 'ख',
  'gha': 'घ',
  'sha': 'श',
  
  // Consonants with 'a'
  'ka': 'का',
  'ga': 'ग',
  'cha': 'च',
  'ja': 'ज',
  'ta': 'ट',
  'da': 'ड',
  'na': 'न',
  'pa': 'प',
  'ba': 'ब',
  'ma': 'म',
  'ya': 'य',
  'ra': 'र',
  'la': 'ल',
  'wa': 'व',
  'sa': 'स',
  'ha': 'ह',
  
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
  
  // Individual vowels
  'a': 'अ',
  'i': 'इ',
  'u': 'उ',
  'e': 'ए',
  'o': 'ओ',
};

function convertWord(word) {
  let result = '';
  let i = 0;

  while (i < word.length) {
    let matched = false;

    for (let len = Math.min(3, word.length - i); len > 0; len--) {
      const substring = word.substring(i, i + len).toLowerCase();
      
      if (romanToNepaliMap[substring]) {
        result += romanToNepaliMap[substring];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += word[i];
      i++;
    }
  }

  return result;
}

function convertToNepaliUnicode(text) {
  if (!text) return text;
  const words = text.split(/(\s+)/);
  return words.map(word => {
    if (!word || /^\s+$/.test(word)) return word;
    return convertWord(word);
  }).join('');
}

// Tests
const tests = [
  { input: 'namaste', expected: 'नमstए' },
  { input: '8452', expected: '८४५२' },
  { input: 'mero', expected: 'मेरो' },
  { input: 'kathmandu', expected: 'कthमndउ' },
  { input: 'rajesh patel', expected: 'रजएsh पtएl' },
];

console.log('Testing Nepali Unicode Converter:\n');
tests.forEach(test => {
  const result = convertToNepaliUnicode(test.input);
  console.log(`"${test.input}" → "${result}"`);
});

