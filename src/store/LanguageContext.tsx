
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type LanguageOption = 'en' | 'ar' | 'system';
type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type Translations = { [key: string]: any };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: LanguageOption) => void;
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
    // This effect runs only once on the client after initial hydration
    setIsMounted(true);
    const storedLang = localStorage.getItem('app-language') as LanguageOption | null;
    setLanguage(storedLang || 'system');
  }, []);

  const setLanguage = useCallback((lang: LanguageOption) => {
    localStorage.setItem('app-language', lang);
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
        .catch(error => {
            console.error(`Could not load ${effectiveLang}.json`, error);
            import(`@/locales/en.json`).then(module => setTranslations(module.default));
        });
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction, isMounted]);

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    if (!isMounted) {
      return ''; 
    }
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
        if (acc && typeof acc === 'object' && acc[currentKey] !== undefined) {
            return acc[currentKey];
        }
        return undefined;
    }, translations);
    
    if (result === undefined) {
        console.warn(`Translation not found for key: ${key}`);
        return key; 
    }

    if (typeof result === 'string' && options) {
        Object.keys(options).forEach(optKey => {
            result = result.replace(new RegExp(`\\{${optKey}\\}`, 'g'), String(options[optKey]));
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
