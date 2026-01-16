# Auto-Translation Guide - LibreTranslate

## Overview
LibreTranslate is a **free, open-source translation service** with NO API key required. Perfect for auto-translating dynamic content.

## Key Benefits
✅ **Completely Free** - No costs, no credit card needed
✅ **No API Key** - Uses public API
✅ **Smart Caching** - Translations cached for 7 days to reduce API calls
✅ **All Languages** - Supports all 8 languages (en, hi, gu, pa, mr, ta, te, bn)
✅ **Fallback** - Returns original text if translation fails
✅ **Fast** - Cached translations load instantly

## How It Works

### 1. Basic Translation
```jsx
import { autoTranslate } from './autoTranslator';
import { useTranslation } from './TranslationContext';

function MyComponent() {
  const { lang } = useTranslation();
  const [translated, setTranslated] = useState("Hello");

  useEffect(() => {
    autoTranslate("Hello", lang).then(setTranslated);
  }, [lang]);

  return <p>{translated}</p>;
}
```

### 2. Translate Multiple Texts
```jsx
import { autoTranslateMultiple } from './autoTranslator';

const items = ["Hello", "World", "Goodbye"];
const translated = await autoTranslateMultiple(items, 'hi');
// Returns: ["नमस्ते", "दुनिया", "अलविदा"]
```

### 3. Translate Objects
```jsx
import { autoTranslateObject } from './autoTranslator';

const data = {
  name: "John",
  email: "john@example.com",
  message: "Hello, how are you?"
};

const translated = await autoTranslateObject(data, 'hi');
// Returns: {
//   name: "जॉन",
//   email: "john@example.com",
//   message: "नमस्ते, आप कैसे हैं?"
// }
```

## Real-World Examples

### Example 1: Translate User Comments
```jsx
function Comments({ comments, lang }) {
  const [translated, setTranslated] = useState(comments);

  useEffect(() => {
    if (lang !== 'en') {
      const texts = comments.map(c => c.text);
      autoTranslateMultiple(texts, lang).then(translations => {
        setTranslated(comments.map((c, i) => ({
          ...c,
          text: translations[i]
        })));
      });
    } else {
      setTranslated(comments);
    }
  }, [comments, lang]);

  return (
    <div>
      {translated.map(comment => (
        <div key={comment.id}>
          <strong>{comment.author}:</strong> {comment.text}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Translate Search Results
```jsx
function SearchResults({ results, lang }) {
  const [translated, setTranslated] = useState([]);

  useEffect(() => {
    if (lang !== 'en' && results.length > 0) {
      // Translate all titles
      const titles = results.map(r => r.title);
      autoTranslateMultiple(titles, lang).then(translatedTitles => {
        setTranslated(results.map((r, i) => ({
          ...r,
          title: translatedTitles[i]
        })));
      });
    } else {
      setTranslated(results);
    }
  }, [results, lang]);

  return (
    <div>
      {translated.map(result => (
        <div key={result.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <h3>{result.title}</h3>
          <p>{result.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Translate Chat Messages
```jsx
import { autoTranslate } from './autoTranslator';

function ChatMessage({ message, lang }) {
  const [translated, setTranslated] = useState(message);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (lang !== 'en') {
      setIsTranslating(true);
      autoTranslate(message, lang)
        .then(setTranslated)
        .finally(() => setIsTranslating(false));
    }
  }, [message, lang]);

  return (
    <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '8px' }}>
      <p>{translated}</p>
      {isTranslating && <small>Translating...</small>}
    </div>
  );
}
```

### Example 4: Translate Alert Messages
```jsx
function Alert({ message, lang, type = 'info' }) {
  const [translated, setTranslated] = useState(message);

  useEffect(() => {
    if (lang !== 'en') {
      autoTranslate(message, lang).then(setTranslated);
    }
  }, [message, lang]);

  const bgColor = {
    success: '#c8e6c9',
    error: '#ffcdd2',
    warning: '#fff9c4',
    info: '#bbdefb'
  }[type];

  return (
    <div style={{ 
      padding: '12px', 
      background: bgColor, 
      borderRadius: '4px',
      marginBottom: '10px'
    }}>
      {translated}
    </div>
  );
}
```

### Example 5: Translate Form Validation Messages
```jsx
function FormValidator({ value, lang }) {
  const [errors, setErrors] = useState([]);
  const [translatedErrors, setTranslatedErrors] = useState([]);

  const validate = async (val) => {
    const newErrors = [];
    if (!val.email) newErrors.push("Email is required");
    if (!val.name) newErrors.push("Name is required");
    if (val.password.length < 6) newErrors.push("Password must be at least 6 characters");
    
    setErrors(newErrors);

    // Translate all error messages
    if (lang !== 'en' && newErrors.length > 0) {
      const translated = await autoTranslateMultiple(newErrors, lang);
      setTranslatedErrors(translated);
    } else {
      setTranslatedErrors(newErrors);
    }
  };

  return (
    <div>
      {translatedErrors.map((error, i) => (
        <div key={i} style={{ color: '#c62828', marginBottom: '8px' }}>
          ✗ {error}
        </div>
      ))}
    </div>
  );
}
```

## Cache System

### Automatic Caching
- Every translation is automatically cached in localStorage
- Cache valid for 7 days
- Reduces API calls significantly
- Transparent to developers

### Check Cache Size
```jsx
import { getTranslationCacheSize } from './autoTranslator';

const sizeKB = getTranslationCacheSize();
console.log(`Cache size: ${sizeKB} KB`);
```

### Clear Cache
```jsx
import { clearTranslationCache } from './autoTranslator';

// Clear all translations
clearTranslationCache();
```

## Performance Tips

1. **Batch Translate** - Use `autoTranslateMultiple` for lists
2. **Cache Check** - Always check cache before translating
3. **Limit Requests** - Don't translate every keystroke
4. **Error Handling** - Always provide fallback text
5. **Loading States** - Show "Translating..." while processing

## Supported Languages

| Code | Language | Native | API Support |
|------|----------|--------|------------|
| en | English | English | ✅ |
| hi | Hindi | हिंदी | ✅ |
| gu | Gujarati | ગુજરાતી | ✅ |
| pa | Punjabi | ਪੰਜਾਬੀ | ✅ |
| mr | Marathi | मराठी | ✅ |
| ta | Tamil | தமிழ் | ✅ |
| te | Telugu | తెలుగు | ✅ |
| bn | Bengali | বাংলা | ✅ |

## API Details

**Endpoint**: `https://libretranslate.de/translate`
**Method**: POST
**Auth**: None (completely free)
**Rate Limit**: ~60 requests per minute
**Response Time**: 200-500ms typically

## Error Handling

The auto-translator automatically handles errors:

```jsx
// If translation fails, returns original text
const result = await autoTranslate("Hello", 'hi');
// Returns: "नमस्ते" OR "Hello" if error
```

## Advanced: Custom Hook

```jsx
import { useTranslation } from './TranslationContext';
import { autoTranslate } from './autoTranslator';

export const useAutoTranslate = (text) => {
  const { lang } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (lang !== 'en' && text) {
      autoTranslate(text, lang).then(setTranslated);
    } else {
      setTranslated(text);
    }
  }, [text, lang]);

  return translated;
};

// Usage:
function MyComponent() {
  const greeting = useAutoTranslate("Hello World");
  return <h1>{greeting}</h1>;
}
```

## Troubleshooting

### Slow translations?
- Translations are cached - first translation is slow, subsequent are instant
- Check network tab for API calls

### Getting English back?
- API might be down (fallback works)
- Check browser console for errors
- Verify language code is correct

### Cache taking up space?
- Clear with `clearTranslationCache()`
- Cache is only 7 days, auto-expires

## Best Practices

✅ **DO:**
- Cache translations
- Handle loading states
- Provide fallbacks
- Use batch translation
- Test all languages

❌ **DON'T:**
- Translate on every keystroke
- Translate the same text multiple times
- Use without caching
- Ignore fallback behavior
- Forget loading indicators

## Examples in Repository

See `src/autoTranslatorExamples.jsx` for complete component examples:
- SimpleTranslationExample
- MessageTranslator
- ListTranslator
- ObjectTranslator
- SearchResultsTranslator
- ErrorTranslator
- CacheManager

---

**Status**: Ready to use ✅
**Free**: Yes ✅
**No API Key**: Required ✅
**All Languages**: Supported ✅
