import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Start with null (show language popup on refresh)
  const [lang, setLang] = useState(null);
  const [defaultLang, setDefaultLang] = useState(() => {
    return localStorage.getItem('default_harvest_lang') || 'en';
  });

  // Check if we have a saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem('harvest_lang');
    if (saved) {
      setLang(saved);
    }
  }, []);

  // Save to localStorage whenever language changes
  useEffect(() => {
    if (lang) {
      localStorage.setItem('harvest_lang', lang);
    }
  }, [lang]);

  const changeLang = (newLang) => {
    setLang(newLang);
  };

  const setDefault = (defaultCode) => {
    setDefaultLang(defaultCode);
    localStorage.setItem('default_harvest_lang', defaultCode);
    setLang(defaultCode);
  };

  return (
    <TranslationContext.Provider value={{ lang, changeLang, defaultLang, setDefault }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
