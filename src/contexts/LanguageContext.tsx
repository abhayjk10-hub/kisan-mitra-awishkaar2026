'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language } from '@/types';
import { t as translateFn } from '@/lib/translations';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = (window.localStorage.getItem('km_language') || window.localStorage.getItem('km_lang')) as Language | null;
    return (stored === 'hi' || stored === 'gu' || stored === 'pa' || stored === 'mr' || stored === 'en') ? stored : 'en';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;

      const handleStorage = (e: StorageEvent) => {
        if ((e.key === 'km_language' || e.key === 'km_lang') && e.newValue) {
          const newLang = e.newValue as Language;
          if (['en', 'hi', 'gu', 'pa', 'mr'].includes(newLang)) {
            setLanguageState(newLang);
            document.documentElement.lang = newLang;
          }
        }
      };

      const handleCustomChange = (e: Event) => {
        const detail = (e as CustomEvent<Language>).detail;
        if (detail && ['en', 'hi', 'gu', 'pa', 'mr'].includes(detail)) {
          setLanguageState(detail);
          document.documentElement.lang = detail;
        }
      };

      window.addEventListener('storage', handleStorage);
      window.addEventListener('km_language_change', handleCustomChange);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('km_language_change', handleCustomChange);
      };
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('km_language', lang);
      window.localStorage.setItem('km_lang', lang);
      document.cookie = `km_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('km_language_change', { detail: lang }));
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translateFn(key, language, params);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
