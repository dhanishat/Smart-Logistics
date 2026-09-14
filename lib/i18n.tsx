'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, LanguageInfo, getLocalizedTranslations, TranslationDictionary } from './translations';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (langCode: string) => void;
  t: (key: string, defaultText?: string) => string;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_LANG_KEY = 'ne_roadsense_lang_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Initialize language from localStorage or default
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setCurrentLanguage(saved);
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
  }, []);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  }, [currentLanguage]);

  const dictionary = useMemo<TranslationDictionary>(() => {
    return getLocalizedTranslations(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = useCallback((langCode: string) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) return;
    setIsTranslating(true);
    setCurrentLanguage(langCode);

    try {
      localStorage.setItem(STORAGE_LANG_KEY, langCode);
      document.documentElement.setAttribute('lang', langCode);
      document.documentElement.setAttribute('data-language', langCode);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }

    // Trigger Google Translate widget if present
    try {
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      const googleTarget = langObj?.googleCode || 'en';
      const selectElem = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (selectElem) {
        selectElem.value = googleTarget;
        selectElem.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      // Ignored if Google Translate widget is not present
    }

    setTimeout(() => {
      setIsTranslating(false);
    }, 150);
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      if (dictionary[key]) {
        return dictionary[key];
      }
      return defaultText || key;
    },
    [dictionary]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
