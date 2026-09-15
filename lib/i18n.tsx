'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, LanguageInfo, getLocalizedTranslations, TranslationDictionary } from './translations';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages?: string; autoDisplay?: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

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
const GOOGLE_TRANSLATE_ELEMENT_ID = 'google_translate_element';

function getGoogleLanguageCode(langCode: string) {
  return SUPPORTED_LANGUAGES.find((language) => language.code === langCode)?.googleCode || 'en';
}

function applyGoogleTranslate(langCode: string) {
  const targetLanguage = getGoogleLanguageCode(langCode);
  const selectElement = document.querySelector<HTMLSelectElement>('.goog-te-combo');

  if (!selectElement) return false;

  selectElement.value = targetLanguage === 'en' ? '' : targetLanguage;
  selectElement.dispatchEvent(new Event('change'));
  return true;
}

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

  useEffect(() => {
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('data-language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID)) return;

    const translateRoot = document.createElement('div');
    translateRoot.id = GOOGLE_TRANSLATE_ELEMENT_ID;
    translateRoot.style.position = 'fixed';
    translateRoot.style.left = '-9999px';
    translateRoot.style.top = '-9999px';
    document.body.appendChild(translateRoot);

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
        },
        GOOGLE_TRANSLATE_ELEMENT_ID
      );
    };

    if (!document.querySelector('script[src*="translate_a/element.js"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
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
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }

    let attempts = 0;
    const translateInterval = window.setInterval(() => {
      attempts += 1;
      if (applyGoogleTranslate(langCode) || attempts >= 20) {
        window.clearInterval(translateInterval);
      }
    }, 250);

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
