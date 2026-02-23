/**
 * Nepali word dictionary for input suggestions
 * Maps romanized words to Nepali Unicode with frequency/priority
 * Ordered by common usage (most common first)
 */
export const nepaliDictionary = {
  // Single characters first for quick response
  'a': ['अ'],
  'i': ['इ'],
  'u': ['उ'],
  'e': ['ए'],
  'o': ['ओ'],
  
  // Super common words
  'ho': ['हो', 'होँ'],
  'to': ['तो'],
  'ta': ['त'],
  'ra': ['र'],
  'la': ['ल'],
  'ma': ['म'],
  'na': ['न'],
  'ha': ['ह'],
  'ka': ['क'],
  'ga': ['ग'],
  'pa': ['प'],
  'ba': ['ब'],
  
  // Very common phrases
  'mero': ['मेरो'],
  'tero': ['तेरो'],
  'usko': ['उस्को'],
  'hamro': ['हाम्रो'],
  'unko': ['उनको'],
  'timro': ['तिम्रो'],
  
  // Country and place
  'desh': ['देश'],
  'nepal': ['नेपाल'],
  'kathmandu': ['काठमाडौं'],
  
  // Greetings
  'namaste': ['नमस्ते'],
  'hello': ['हेलो'],
  'thanks': ['धन्यवाद'],
  'goodbye': ['अलविदा'],
  
  // Common verbs
  'am': ['छु'],
  'is': ['छ'],
  'are': ['छौ'],
  'was': ['थिएँ'],
  'been': ['भएको'],
  'have': ['छ'],
  'has': ['छ'],
  'do': ['गर्छु'],
  'does': ['गर्छ'],
  'did': ['गरे'],
  'go': ['जा'],
  'come': ['आ'],
  'say': ['भन्नु'],
  
  // Common adjectives
  'good': ['राम्रो'],
  'bad': ['खराब'],
  'big': ['ठूलो'],
  'small': ['सानो'],
  'hot': ['तातो'],
  'cold': ['चिसो'],
  
  // Common nouns
  'name': ['नाम'],
  'address': ['ठेगाना', 'पता'],
  'date': ['मिति'],
  'time': ['समय'],
  'year': ['वर्ष'],
  'month': ['महिना'],
  'day': ['दिन'],
  'office': ['कार्यालय'],
  'company': ['कम्पनी'],
  'school': ['स्कुल'],
  'hospital': ['अस्पताल'],
  'phone': ['फोन'],
  'email': ['ईमेल'],
  'letter': ['पत्र'],
  'document': ['दस्तावेज'],
  'work': ['काम'],
  'money': ['पैसा'],
  'person': ['व्यक्ति'],
  'man': ['मानिस'],
  'woman': ['महिला'],
  'child': ['बालक'],
  'friend': ['साथी'],
  'family': ['परिवार'],
  
  // Time related
  'morning': ['बिहान'],
  'evening': ['साँझ'],
  'night': ['रात'],
  'today': ['आज'],
  'tomorrow': ['भोली'],
  'yesterday': ['हिजो'],
  
  // Politeness and respect
  'sir': ['श्रीमान्'],
  'madam': ['श्रीमती'],
  'mr': ['श्री'],
  'ms': ['श्रीमती'],
  'please': ['कृपया'],
  'thank': ['धन्यवाद'],
  'yes': ['हो', 'जी'],
  'no': ['होइन', 'नहीँ'],
  'ok': ['ठीक'],
  
  // Numbers
  'zero': ['शून्य'],
  'one': ['एक'],
  'two': ['दुई'],
  'three': ['तीन'],
  'four': ['चार'],
  'five': ['पाँच'],
  'six': ['छ'],
  'seven': ['सात'],
  'eight': ['आठ'],
  'nine': ['नौ'],
  'ten': ['दश'],
};

/**
 * Get suggestions for romanized input
 * Returns array of Nepali Unicode suggestions ordered by relevance
 */
export function getNepaliSuggestions(romanizedText) {
  if (!romanizedText || romanizedText.length === 0) return [];

  const normalized = romanizedText.toLowerCase().trim();

  // Exact match - highest priority
  if (nepaliDictionary[normalized]) {
    return nepaliDictionary[normalized];
  }

  // Prefix match - find words that start with the input
  const suggestions = [];
  const suggestionsMap = new Map();
  
  for (const [roman, nepaliWords] of Object.entries(nepaliDictionary)) {
    if (roman.startsWith(normalized)) {
      // Avoid duplicates while preserving order
      nepaliWords.forEach(word => {
        if (!suggestionsMap.has(word)) {
          suggestionsMap.set(word, true);
          suggestions.push(word);
        }
      });
    }
  }

  return suggestions.slice(0, 10); // Limit to 10 suggestions
}

/**
 * Get a single best suggestion
 */
export function getBestNepaliSuggestion(romanizedText) {
  const suggestions = getNepaliSuggestions(romanizedText);
  return suggestions.length > 0 ? suggestions[0] : null;
}
