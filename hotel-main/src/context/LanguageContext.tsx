import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.ts';
import { Language } from '../types/index.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'ltr' | 'rtl';
  t: (key: keyof typeof translations.fr) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default is French as requested and aligned in Phase 1
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lgd_lang', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('lgd_lang') as Language;
    if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const t = (key: keyof typeof translations.fr): string => {
    const langDict = translations[language] || translations.fr;
    return langDict[key] || translations.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
