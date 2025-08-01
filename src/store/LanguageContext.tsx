
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type Translations = { [key: string]: any };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: 'en' | 'ar' | 'system') => void;
  direction: Direction;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [direction, setDirection] = useState<Direction>('ltr');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setLanguage = useCallback((lang: 'en' | 'ar' | 'system') => {
    let effectiveLang: Language = 'en'; // Default
    if (lang === 'system') {
        if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language.split('-')[0];
            effectiveLang = browserLang === 'ar' ? 'ar' : 'en';
        }
    } else {
        effectiveLang = lang;
    }

    setLanguageState(effectiveLang);
    const newDirection = effectiveLang === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);

    import(`@/locales/${effectiveLang}.json`)
        .then(module => setTranslations(module.default))
        .catch(error => console.error(`Could not load ${effectiveLang}.json`, error));
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction, isMounted]);

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    if (!isMounted) {
      return ''; // Return empty string or a placeholder during server render/hydration
    }
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
        if (acc && typeof acc === 'object' && acc[currentKey] !== undefined) {
            return acc[currentKey];
        }
        return undefined;
    }, translations);
    
    if (result === undefined) {
        // Fallback to English translation if key not found in current language
        import(`@/locales/en.json`).then(module => {
            let enResult = keys.reduce((acc, currentKey) => (acc && acc[currentKey]) ? acc[currentKey] : undefined, module.default);
             if (enResult === undefined) {
                console.warn(`Translation not found for key: ${key}`);
             }
        });
        return key; // return key as fallback
    }

    if (typeof result === 'string' && options) {
        Object.keys(options).forEach(optKey => {
            result = result.replace(`{${optKey}}`, String(options[optKey]));
        });
    }

    return result;
  };

  const value = { language, setLanguage, direction, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
