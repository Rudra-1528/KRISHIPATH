# Quick Reference - Auto-Translation & Languages

## 🌐 Language Selection
| Action | Result |
|--------|--------|
| Refresh page | Language popup appears |
| Select language | Saved to localStorage |
| Click 🌐 button (top-right) | Change language instantly |
| Close (X) on role screen | Back to language popup |

## 🤖 Auto-Translation API

### Single Text
```javascript
const hindi = await autoTranslate("Hello", "hi");
```

### Multiple Texts
```javascript
const translations = await autoTranslateMultiple(
  ["Hello", "Goodbye"], 
  "hi"
);
```

### Objects/Forms
```javascript
const data = await autoTranslateObject(
  { name: "John", email: "john@example.com" },
  "hi"
);
```

### Cache Management
```javascript
// Get cache size
const kb = getTranslationCacheSize();

// Clear all cache
clearTranslationCache();
```

## 📍 Imports

### For Language Selection
```jsx
import { useTranslation } from './TranslationContext';
import { availableLanguages } from './translationHelper';
```

### For Translation
```jsx
import { 
  autoTranslate,
  autoTranslateMultiple,
  autoTranslateObject,
  clearTranslationCache,
  getTranslationCacheSize
} from './autoTranslator';
```

### For Manual Translations
```jsx
import { t } from './translationHelper';
```

## 📋 Language Codes
```
en - English
hi - Hindi (हिंदी)
gu - Gujarati (ગુજરાતી)
pa - Punjabi (ਪੰਜਾਬੀ)
mr - Marathi (मराठी)
ta - Tamil (தமிழ்)
te - Telugu (తెలుగు)
bn - Bengali (বাংলা)
```

## 💻 React Component Pattern

```jsx
import { useTranslation } from './TranslationContext';
import { autoTranslate } from './autoTranslator';

function MyComponent() {
  const { lang } = useTranslation();
  const [text, setText] = useState("Original");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lang !== 'en') {
      setLoading(true);
      autoTranslate("Original", lang)
        .then(setText)
        .finally(() => setLoading(false));
    }
  }, [lang]);

  return (
    <div>
      <p>{text}</p>
      {loading && <p>Translating...</p>}
    </div>
  );
}
```

## 🔄 State Management

### Get Current Language
```jsx
const { lang } = useTranslation();
// Returns: "en" | "hi" | "gu" | "pa" | "mr" | "ta" | "te" | "bn" | null
```

### Change Language
```jsx
const { changeLang } = useTranslation();
changeLang("hi");
```

### Set Default Language
```jsx
const { setDefault } = useTranslation();
setDefault("hi");
```

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| 8 Languages | ✅ | All Indian languages supported |
| Language Popup on Refresh | ✅ | Shows every time page loads |
| Auto-Translation | ✅ | LibreTranslate (FREE) |
| Caching | ✅ | 7-day cache in localStorage |
| No API Key | ✅ | Completely free |
| Fallback | ✅ | Returns English if error |
| Batch Translation | ✅ | Translate multiple texts |
| Object Translation | ✅ | Translate object values |

## 🎯 Common Use Cases

### Translate Chat Message
```jsx
const chat = await autoTranslate(userMessage, lang);
```

### Translate Form Errors
```jsx
const errors = await autoTranslateMultiple(errorList, lang);
```

### Translate API Response
```jsx
const data = await autoTranslateObject(apiData, lang);
```

### Display Loading
```jsx
{isTranslating && <p>🔄 Translating...</p>}
```

## 📊 Performance

| Operation | Speed | Notes |
|-----------|-------|-------|
| 1st Translation | 200-500ms | API call |
| Cached Translation | <10ms | localStorage |
| Batch (10 items) | 500ms-1s | API batched |
| Cache Size | ~5-10KB | Per 100 translations |

## 🐛 Debugging

### Check if language is set
```jsx
const { lang } = useTranslation();
console.log("Current language:", lang);
```

### Check cache
```javascript
console.log("Cache size:", getTranslationCacheSize(), "KB");
```

### Test translation
```javascript
autoTranslate("Hello", "hi").then(result => {
  console.log("Hindi:", result);
});
```

### Check localStorage
```javascript
console.log("Saved lang:", localStorage.getItem('harvest_lang'));
console.log("Default lang:", localStorage.getItem('default_harvest_lang'));
```

## 🚀 Getting Started

### Step 1: Add Translation
```jsx
import { autoTranslate } from './autoTranslator';

const result = await autoTranslate("Hello World", "hi");
console.log(result); // नमस्ते दुनिया
```

### Step 2: Handle Language Changes
```jsx
const { lang } = useTranslation();

useEffect(() => {
  // Re-translate when language changes
  autoTranslate(originalText, lang).then(setTranslated);
}, [lang]);
```

### Step 3: Show Loading State
```jsx
const [isTranslating, setIsTranslating] = useState(false);

useEffect(() => {
  setIsTranslating(true);
  autoTranslate(text, lang)
    .then(setTranslated)
    .finally(() => setIsTranslating(false));
}, [text, lang]);
```

## 📚 Full Docs

- **LANGUAGE_SETUP.md** - Language system details
- **AUTO_TRANSLATION_GUIDE.md** - Auto-translation complete guide
- **TRANSLATION_EXAMPLES.md** - Translation examples
- **IMPLEMENTATION_SUMMARY.md** - Full overview

---

**Questions?** Check the documentation files!
