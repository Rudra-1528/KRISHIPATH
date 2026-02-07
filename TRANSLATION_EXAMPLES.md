# Quick Translation Examples

## How to Add New Translations

### Example 1: Adding a Modal Message
**File**: `src/translations.js`

```javascript
export const translations = {
  // ... existing code ...
  
  // Add new section
  alerts: {
    en: { 
      title: "Alert", 
      dismiss: "Dismiss",
      confirm: "Confirm"
    },
    hi: { 
      title: "सूचना", 
      dismiss: "खारिज करें",
      confirm: "पुष्टि करें"
    },
    gu: { 
      title: "સૂચના", 
      dismiss: "ખारજ કરો",
      confirm: "પુષ્ટિ કરો"
    },
    // ... add all other languages
  }
};
```

**File**: Your component
```jsx
import { t } from '../translationHelper';
import { useTranslation } from '../TranslationContext';

function AlertModal() {
  const { lang } = useTranslation();
  
  return (
    <div>
      <h2>{t('alerts', 'title', lang)}</h2>
      <button>{t('alerts', 'dismiss', lang)}</button>
      <button>{t('alerts', 'confirm', lang)}</button>
    </div>
  );
}
```

---

### Example 2: Adding Form Labels

**File**: `src/translations.js`

```javascript
export const translations = {
  forms: {
    en: {
      email: "Email Address",
      password: "Password",
      submit: "Submit",
      cancel: "Cancel"
    },
    hi: {
      email: "ईमेल पता",
      password: "पासवर्ड",
      submit: "जमा करें",
      cancel: "रद्द करें"
    },
    gu: {
      email: "ઈમેલ સરનામું",
      password: "પાસવર્ડ",
      submit: "સબમિટ કરો",
      cancel: "રદ્દ કરો"
    },
    // ... all languages
  }
};
```

---

### Example 3: Using in a Form Component

```jsx
import { t } from '../translationHelper';
import { useTranslation } from '../TranslationContext';

function LoginForm() {
  const { lang } = useTranslation();
  
  return (
    <form>
      <label>{t('forms', 'email', lang)}</label>
      <input type="email" placeholder={t('forms', 'email', lang)} />
      
      <label>{t('forms', 'password', lang)}</label>
      <input type="password" placeholder={t('forms', 'password', lang)} />
      
      <button type="submit">{t('forms', 'submit', lang)}</button>
      <button type="reset">{t('forms', 'cancel', lang)}</button>
    </form>
  );
}
```

---

## Common Translation Patterns

### Status Messages
```javascript
status: {
  en: {
    success: "Operation completed successfully",
    error: "Something went wrong",
    loading: "Loading...",
    pending: "Processing..."
  },
  hi: {
    success: "ऑपरेशन सफलतापूर्वक पूरा हुआ",
    error: "कुछ गलत हुआ",
    loading: "लोड हो रहा है...",
    pending: "प्रसंस्करण..."
  },
  // ... rest of languages
}
```

### Validation Messages
```javascript
validation: {
  en: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match"
  },
  hi: {
    required: "यह क्षेत्र आवश्यक है",
    invalidEmail: "कृपया एक वैध ईमेल दर्ज करें",
    passwordTooShort: "पासवर्ड कम से कम 6 वर्ण होना चाहिए",
    passwordMismatch: "पासवर्ड मेल नहीं खाते"
  },
  // ... rest of languages
}
```

### Action Buttons
```javascript
actions: {
  en: {
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add New",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    export: "Export",
    import: "Import"
  },
  hi: {
    save: "सहेजें",
    delete: "हटाएं",
    edit: "संपादित करें",
    add: "नया जोड़ें",
    search: "खोजें",
    filter: "फ़िल्टर करें",
    sort: "सॉर्ट करें",
    export: "निर्यात करें",
    import: "आयात करें"
  },
  // ... rest of languages
}
```

---

## Best Practices

✅ **DO:**
- Group related strings in sections
- Use lowercase keys
- Be consistent with terminology
- Test all languages
- Use native speakers for quality

❌ **DON'T:**
- Use HTML in translation strings
- Mix English with other languages
- Forget to add to all languages
- Use machine translation without review
- Hard-code strings in components

---

## Testing New Translations

```jsx
function TestComponent() {
  const { lang, changeLang } = useTranslation();
  
  return (
    <div>
      <p>{t('mySection', 'myKey', lang)}</p>
      
      <button onClick={() => changeLang('hi')}>Test Hindi</button>
      <button onClick={() => changeLang('en')}>Test English</button>
      <button onClick={() => changeLang('gu')}>Test Gujarati</button>
    </div>
  );
}
```

---

## Language Codes Reference

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| hi | Hindi | हिंदी |
| gu | Gujarati | ગુજરાતી |
| pa | Punjabi | ਪੰਜਾਬੀ |
| mr | Marathi | मराठी |
| ta | Tamil | தமிழ் |
| te | Telugu | తెలుగు |
| bn | Bengali | বাংলা |

---

## Auto-Generate Missing Translations

If you want to auto-fill missing translations using an API:

```javascript
// Helper function to find missing translations
export function findMissingTranslations(section) {
  const allLangs = ['en', 'hi', 'gu', 'pa', 'mr', 'ta', 'te', 'bn'];
  const missing = {};
  
  allLangs.forEach(lang => {
    if (!translations[section][lang]) {
      missing[lang] = `Need ${lang} translation for ${section}`;
    }
  });
  
  return missing;
}

// Usage
console.log(findMissingTranslations('dashboard'));
```

---

## Common Indian Language Resources

- **Hindi (हिंदी)**: Official language of India
- **Gujarati (ગુજરાતી)**: Primary in Gujarat
- **Punjabi (ਪੰਜਾਬੀ)**: Primary in Punjab
- **Marathi (मराठी)**: Primary in Maharashtra
- **Tamil (தமிழ்)**: Primary in Tamil Nadu
- **Telugu (తెలుగు)**: Primary in Telangana & Andhra Pradesh
- **Bengali (বাংলা)**: Primary in West Bengal & Bangladesh

All these are fully supported in KRISHIPATH! ✅
