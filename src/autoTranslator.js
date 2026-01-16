/**
 * Auto-Translation Service using LibreTranslate (Free, No API Key Needed)
 * 
 * Features:
 * - Free public API (no signup required)
 * - Supports 8 Indian languages
 * - Caches translations in localStorage
 * - Fallback to English if translation fails
 * 
 * Usage:
 * import { autoTranslate } from './autoTranslator';
 * const hindi = await autoTranslate("Hello", "hi");
 */

// Configuration
const LIBRETRANSLATE_API = 'https://libretranslate.de/translate';
const CACHE_PREFIX = 'libretranslate_cache_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Language code mapping
const LANG_MAP = {
  en: 'en',
  hi: 'hi',
  gu: 'gu',
  pa: 'pa',
  mr: 'mr',
  ta: 'ta',
  te: 'te',
  bn: 'bn'
};

/**
 * Get cached translation from localStorage
 */
const getCachedTranslation = (text, targetLang) => {
  const cacheKey = `${CACHE_PREFIX}${targetLang}_${text}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { value, timestamp } = JSON.parse(cached);
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return value;
    } else {
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  }
  return null;
};

/**
 * Save translation to cache
 */
const cacheTranslation = (text, targetLang, translation) => {
  const cacheKey = `${CACHE_PREFIX}${targetLang}_${text}`;
  const cacheData = {
    value: translation,
    timestamp: Date.now()
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, hi, gu, etc.)
 * @returns {Promise<string>} - Translated text
 */
export const autoTranslate = async (text, targetLang) => {
  // If English, return as is
  if (targetLang === 'en') {
    return text;
  }

  // Check cache first
  const cached = getCachedTranslation(text, targetLang);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(LIBRETRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: LANG_MAP[targetLang] || 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      console.warn(`Translation API error: ${response.status}`);
      return text; // Fallback to original text
    }

    const data = await response.json();
    const translation = data.translatedText || text;
    
    // Cache the translation
    cacheTranslation(text, targetLang, translation);
    
    return translation;
  } catch (error) {
    console.warn('Translation error:', error);
    return text; // Fallback to original text
  }
};

/**
 * Translate multiple texts at once
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const autoTranslateMultiple = async (texts, targetLang) => {
  if (targetLang === 'en') {
    return texts;
  }

  try {
    const results = await Promise.all(
      texts.map(text => autoTranslate(text, targetLang))
    );
    return results;
  } catch (error) {
    console.warn('Batch translation error:', error);
    return texts; // Fallback to original texts
  }
};

/**
 * Translate an object's values
 * Useful for translating form labels, button text, etc.
 * 
 * @param {object} obj - Object with string values to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<object>} - New object with translated values
 * 
 * Example:
 * const labels = { email: "Email", password: "Password" };
 * const translated = await autoTranslateObject(labels, 'hi');
 * // Returns: { email: "ईमेल", password: "पासवर्ड" }
 */
export const autoTranslateObject = async (obj, targetLang) => {
  if (targetLang === 'en') {
    return obj;
  }

  const translated = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      translated[key] = await autoTranslate(value, targetLang);
    } else if (typeof value === 'object' && value !== null) {
      translated[key] = await autoTranslateObject(value, targetLang);
    } else {
      translated[key] = value;
    }
  }
  
  return translated;
};

/**
 * Hook for using auto-translation in React components
 * 
 * Usage:
 * const text = useAutoTranslate("Hello World", lang);
 */
export const useAutoTranslate = (text, lang) => {
  const [translated, setTranslated] = React.useState(text);

  React.useEffect(() => {
    if (text && lang !== 'en') {
      autoTranslate(text, lang).then(setTranslated);
    } else {
      setTranslated(text);
    }
  }, [text, lang]);

  return translated;
};

/**
 * Clear translation cache
 * Useful when you want to free up localStorage space
 */
export const clearTranslationCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Get cache size in KB
 */
export const getTranslationCacheSize = () => {
  let size = 0;
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      size += localStorage.getItem(key).length;
    }
  });
  return (size / 1024).toFixed(2); // Convert to KB
};

/**
 * Available languages supported by LibreTranslate
 */
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिंदी' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  mr: { name: 'Marathi', native: 'मराठी' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  bn: { name: 'Bengali', native: 'বাংলা' }
};
