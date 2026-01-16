/**
 * AutoTranslator Utilities & Examples
 * 
 * This file shows how to use auto-translation in your components
 */

import React from 'react';
import { 
  autoTranslate, 
  autoTranslateMultiple, 
  autoTranslateObject,
  clearTranslationCache,
  getTranslationCacheSize 
} from './autoTranslator';

/**
 * EXAMPLE 1: Simple text translation
 * Use this for dynamically translating user-provided content
 */
export const SimpleTranslationExample = ({ text, lang }) => {
  const [translated, setTranslated] = React.useState(text);

  React.useEffect(() => {
    if (text && lang !== 'en') {
      autoTranslate(text, lang).then(setTranslated);
    } else {
      setTranslated(text);
    }
  }, [text, lang]);

  return <div>{translated}</div>;
};

/**
 * EXAMPLE 2: Auto-translate chat or user messages
 */
export const MessageTranslator = ({ message, lang }) => {
  const [translated, setTranslated] = React.useState(message);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (lang !== 'en') {
      setIsLoading(true);
      autoTranslate(message, lang)
        .then(setTranslated)
        .finally(() => setIsLoading(false));
    } else {
      setTranslated(message);
      setIsLoading(false);
    }
  }, [message, lang]);

  return (
    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
      <p>{translated}</p>
      {isLoading && <small style={{ color: '#999' }}>Translating...</small>}
    </div>
  );
};

/**
 * EXAMPLE 3: Translate array of items
 * Perfect for lists, tables, etc.
 */
export const ListTranslator = ({ items, lang }) => {
  const [translated, setTranslated] = React.useState(items);

  React.useEffect(() => {
    if (lang !== 'en') {
      autoTranslateMultiple(items, lang).then(setTranslated);
    } else {
      setTranslated(items);
    }
  }, [items, lang]);

  return (
    <ul>
      {translated.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
};

/**
 * EXAMPLE 4: Translate object with multiple fields
 * Perfect for form labels, card data, etc.
 */
export const ObjectTranslator = ({ data, lang }) => {
  const [translated, setTranslated] = React.useState(data);

  React.useEffect(() => {
    if (lang !== 'en') {
      autoTranslateObject(data, lang).then(setTranslated);
    } else {
      setTranslated(data);
    }
  }, [data, lang]);

  return (
    <div style={{ padding: '15px', background: '#white', border: '1px solid #ddd' }}>
      {Object.entries(translated).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
};

/**
 * EXAMPLE 5: Real-time search results translation
 */
export const SearchResultsTranslator = ({ results, lang }) => {
  const [translated, setTranslated] = React.useState(results);

  React.useEffect(() => {
    if (lang !== 'en' && results.length > 0) {
      const texts = results.map(r => r.title);
      autoTranslateMultiple(texts, lang).then(translatedTitles => {
        setTranslated(results.map((r, idx) => ({
          ...r,
          title: translatedTitles[idx]
        })));
      });
    } else {
      setTranslated(results);
    }
  }, [results, lang]);

  return (
    <div>
      {translated.map((result, idx) => (
        <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          <h4>{result.title}</h4>
          <p>{result.description}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * EXAMPLE 6: Cache management component
 * Shows cache size and allows clearing
 */
export const CacheManager = () => {
  const [cacheSize, setCacheSize] = React.useState(0);

  React.useEffect(() => {
    const size = getTranslationCacheSize();
    setCacheSize(size);
  }, []);

  const handleClearCache = () => {
    clearTranslationCache();
    setCacheSize(0);
    alert('Translation cache cleared!');
  };

  return (
    <div style={{ padding: '15px', background: '#fffbea', border: '1px solid #ffc107', borderRadius: '8px' }}>
      <h3>Translation Cache</h3>
      <p>Cache Size: <strong>{cacheSize} KB</strong></p>
      <button 
        onClick={handleClearCache}
        style={{
          padding: '8px 16px',
          background: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear Cache
      </button>
    </div>
  );
};

/**
 * EXAMPLE 7: Error message translator
 * Translates error messages from API responses
 */
export const ErrorTranslator = ({ errorMessage, lang }) => {
  const [translated, setTranslated] = React.useState(errorMessage);

  React.useEffect(() => {
    if (errorMessage && lang !== 'en') {
      autoTranslate(errorMessage, lang).then(setTranslated);
    } else {
      setTranslated(errorMessage);
    }
  }, [errorMessage, lang]);

  return (
    <div style={{
      padding: '12px',
      background: '#ffebee',
      color: '#c62828',
      borderRadius: '4px',
      border: '1px solid #ef5350'
    }}>
      ⚠️ {translated}
    </div>
  );
};

/**
 * USAGE IN YOUR COMPONENTS:
 * 
 * 1. For simple text:
 *    <SimpleTranslationExample text="Hello" lang={lang} />
 * 
 * 2. For user messages:
 *    <MessageTranslator message={userMessage} lang={lang} />
 * 
 * 3. For lists:
 *    <ListTranslator items={["Item 1", "Item 2"]} lang={lang} />
 * 
 * 4. For objects:
 *    <ObjectTranslator data={{ name: "John", email: "john@example.com" }} lang={lang} />
 * 
 * 5. For search results:
 *    <SearchResultsTranslator results={searchResults} lang={lang} />
 * 
 * 6. For cache management:
 *    <CacheManager />
 * 
 * 7. For errors:
 *    <ErrorTranslator errorMessage={error} lang={lang} />
 */

/**
 * ADVANCED: Use in custom hooks
 * 
 * export const useTranslatedData = (data, lang) => {
 *   const [translated, setTranslated] = useState(data);
 * 
 *   useEffect(() => {
 *     if (lang !== 'en') {
 *       autoTranslateObject(data, lang).then(setTranslated);
 *     } else {
 *       setTranslated(data);
 *     }
 *   }, [data, lang]);
 * 
 *   return translated;
 * };
 * 
 * // Usage:
 * const MyComponent = ({ lang }) => {
 *   const data = { title: "Hello", desc: "World" };
 *   const translated = useTranslatedData(data, lang);
 *   return <div>{translated.title}</div>;
 * };
 */
