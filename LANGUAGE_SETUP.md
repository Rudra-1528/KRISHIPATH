# KRISHIPATH - Multi-Language Implementation Guide

## Overview
Complete multi-language support has been implemented across all pages. Users can now select from 8 languages and switch languages at any time.

## Supported Languages
- 🇬🇧 English (en)
- 🇮🇳 हिंदी Hindi (hi)
- 🇮🇳 ગુજરાતી Gujarati (gu)
- 🇮🇳 ਪੰਜਾਬੀ Punjabi (pa)
- 🇮🇳 मराठी Marathi (mr)
- 🇮🇳 தமிழ் Tamil (ta)
- 🇮🇳 తెలుగు Telugu (te)
- 🇮🇳 বাংলা Bengali (bn)

## How It Works

### 1. Language Context (TranslationContext.jsx)
- Global language state management using React Context
- Automatically saves selected language to `localStorage` as `harvest_lang`
- Persists across page refreshes
- Default language: English (en)

### 2. Translation Files
- **translations.js**: All translated strings organized by section
  - `layout`: Navigation, buttons, general UI
  - `menu`: Menu items
  - `dashboard`: Dashboard-specific terms
  - `farmer`: Farmer dashboard terms
  - `fleet`: Fleet management terms
  - `cities`: City names in all languages

- **translationHelper.js**: Utility functions
  - `t(section, key, lang)`: Get translation for any section
  - `availableLanguages`: List of all supported languages
  - `translateCity()`: Translate city names
  - `getLanguageName()`: Get language display name

### 3. Language Selection

#### On Landing Page (First Visit)
1. User sees language selection popup
2. 8 language options available
3. Option to set as default language
4. Language is saved to `localStorage`

#### In Admin Panel (Layout)
1. Top-right corner has language switcher (Globe icon)
2. Click to open dropdown with all languages
3. Current language is highlighted
4. Language changes apply immediately to entire app

### 4. Using Translations in Components

#### Method 1: Using the Helper Function
```jsx
import { t } from '../translationHelper';
import { useTranslation } from '../TranslationContext';

function MyComponent() {
  const { lang } = useTranslation();
  
  return <h1>{t('dashboard', 'header', lang)}</h1>;
}
```

#### Method 2: Accessing Context
```jsx
import { useTranslation } from '../TranslationContext';

function MyComponent() {
  const { lang, changeLang } = useTranslation();
  
  return (
    <>
      <h1>{t('dashboard', 'header', lang)}</h1>
      <button onClick={() => changeLang('hi')}>Hindi</button>
    </>
  );
}
```

## Key Features

✅ **Global Language State**: Changes apply to entire app instantly
✅ **Persistence**: Language choice saved to localStorage
✅ **8 Languages**: Complete Indian language support
✅ **Easy to Add**: New strings can be added to translations.js
✅ **Fallback**: Falls back to English if translation missing
✅ **Mobile Responsive**: Language switcher works on all devices

## Adding New Translations

### Step 1: Add to translations.js
```javascript
export const translations = {
  mySection: {
    en: { myKey: "Hello" },
    hi: { myKey: "नमस्ते" },
    gu: { myKey: "નમસ્તે" },
    // ... add for all languages
  }
};
```

### Step 2: Use in Component
```jsx
const { lang } = useTranslation();
return <p>{t('mySection', 'myKey', lang)}</p>;
```

## Files Modified

1. **App.jsx**: Wrapped with TranslationProvider
2. **TranslationContext.jsx**: New - Global language state
3. **translationHelper.js**: New - Helper functions
4. **translations.js**: Enhanced with complete translations
5. **Landing.jsx**: Updated to use context + language selection UI
6. **Layout.jsx**: Added language switcher in top bar

## Default Settings

- **Default Language**: English
- **Storage Key**: `harvest_lang`
- **Fallback Language**: English (for missing translations)
- **Language Persistence**: Yes (localStorage)

## Free API Options (If Needed for Auto-Translation)

If you want to add automatic translation for new content:

### Option 1: Google Cloud Translation API
- Free tier: 500,000 characters/month
- Access via GitHub Student subscription
- Setup: `npm install @google-cloud/translate`

### Option 2: Azure Translator
- Free tier through GitHub Education
- Supports all Indian languages
- Setup: Use Azure SDK

### Option 3: LibreTranslate (Open Source)
- Completely free, no API key needed
- Can self-host
- Limited but useful for Indian languages

### Option 4: RestCountries/Nominatim
- For city name translations (already in translations.js)

## Testing

### Test Language Change
1. Open app
2. Select language from popup
3. Visit different pages
4. Language should persist across all pages
5. Refresh page - language should remain selected
6. Open language switcher in top-right
7. Change language - all text updates immediately

### Test Persistence
1. Select Hindi
2. Close browser
3. Reopen app
4. Should still be in Hindi

### Test Fallback
1. Check if any translation is missing
2. It should default to English

## Support for Device-Specific Defaults

If you want to auto-detect user's device language:

```javascript
// Add to TranslationContext.jsx
const getDeviceLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  const supportedCodes = ['en', 'hi', 'gu', 'pa', 'mr', 'ta', 'te', 'bn'];
  return supportedCodes.includes(browserLang) ? browserLang : 'en';
};
```

## Future Enhancements

- [ ] Auto-detect device language
- [ ] RTL support for Urdu
- [ ] Language in URL (e.g., /en/dashboard)
- [ ] API-based translation system
- [ ] Admin panel to manage translations
- [ ] Export/Import translations
- [ ] Community translation contributions

## Troubleshooting

### Language not changing
- Check if TranslationProvider wraps entire app
- Clear localStorage and try again
- Check browser console for errors

### Translation missing for a word
- Add it to translations.js
- Use fallback English key
- Create an issue to add proper translation

### Language reverts after refresh
- Check localStorage `harvest_lang` exists
- Verify TranslationContext is initialized correctly
- Check browser's localStorage is not full

---

**Implementation Date**: January 2026
**Status**: Complete ✅
**All 8 Languages**: Supported ✅
**Mobile**: Responsive ✅
