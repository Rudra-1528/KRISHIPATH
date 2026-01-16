import { translations } from './translations';

// Helper function to get translation safely
export const t = (section, key, lang = 'en') => {
  try {
    if (translations[section] && translations[section][lang] && translations[section][lang][key]) {
      return translations[section][lang][key];
    }
    // Fallback to English if translation not found
    if (translations[section] && translations[section]['en'] && translations[section]['en'][key]) {
      return translations[section]['en'][key];
    }
    // Return key itself if nothing found
    return key;
  } catch (e) {
    return key;
  }
};

// Get all available languages
export const availableLanguages = [
  { code: 'en', label: '🇬🇧 English', name: 'English', dir: 'ltr' },
  { code: 'hi', label: '🇮🇳 हिंदी', name: 'Hindi', dir: 'ltr' },
  { code: 'gu', label: '🇮🇳 ગુજરાતી', name: 'Gujarati', dir: 'ltr' },
  { code: 'pa', label: '🇮🇳 ਪੰਜਾਬੀ', name: 'Punjabi', dir: 'ltr' },
  { code: 'mr', label: '🇮🇳 मराठी', name: 'Marathi', dir: 'ltr' },
  { code: 'ta', label: '🇮🇳 தமிழ்', name: 'Tamil', dir: 'ltr' },
  { code: 'te', label: '🇮🇳 తెలుగు', name: 'Telugu', dir: 'ltr' },
  { code: 'bn', label: '🇮🇳 বাংলা', name: 'Bengali', dir: 'ltr' },
];

// Translate a city name
export const translateCity = (cityName, lang = 'en') => {
  if (translations.cities && translations.cities[cityName]) {
    return translations.cities[cityName][lang] || cityName;
  }
  return cityName;
};

// Get current language name
export const getLanguageName = (langCode) => {
  const lang = availableLanguages.find(l => l.code === langCode);
  return lang ? lang.label : langCode;
};
