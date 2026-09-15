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

const SCRIPT_ROMANIZATION = Object.fromEntries([
  ['अ', 'a'], ['आ', 'aa'], ['इ', 'i'], ['ई', 'ee'], ['उ', 'u'], ['ऊ', 'oo'], ['ए', 'e'], ['ऐ', 'ai'], ['ओ', 'o'], ['औ', 'au'],
  ['क', 'ka'], ['ख', 'kha'], ['ग', 'ga'], ['घ', 'gha'], ['च', 'cha'], ['छ', 'chha'], ['ज', 'ja'], ['झ', 'jha'], ['ट', 'ta'], ['ठ', 'tha'], ['ड', 'da'], ['ढ', 'dha'],
  ['त', 'ta'], ['थ', 'tha'], ['द', 'da'], ['ध', 'dha'], ['न', 'na'], ['प', 'pa'], ['फ', 'pha'], ['ब', 'ba'], ['भ', 'bha'], ['म', 'ma'], ['य', 'ya'], ['र', 'ra'],
  ['ल', 'la'], ['व', 'va'], ['श', 'sha'], ['ष', 'sha'], ['स', 'sa'], ['ह', 'ha'], ['ं', 'n'], ['ः', 'h'], ['ँ', 'n'], ['ा', 'aa'], ['ि', 'i'], ['ी', 'ee'],
  ['ु', 'u'], ['ू', 'oo'], ['े', 'e'], ['ै', 'ai'], ['ो', 'o'], ['ौ', 'au'], ['्', ''],
  ['অ', 'o'], ['আ', 'aa'], ['ই', 'i'], ['ঈ', 'ee'], ['উ', 'u'], ['ঊ', 'oo'], ['এ', 'e'], ['ঐ', 'oi'], ['ও', 'o'], ['ঔ', 'ou'],
  ['ক', 'ko'], ['খ', 'kho'], ['গ', 'go'], ['ঘ', 'gho'], ['চ', 'cho'], ['ছ', 'chho'], ['জ', 'jo'], ['ঝ', 'jho'], ['ট', 'to'], ['ঠ', 'tho'], ['ড', 'do'], ['ঢ', 'dho'],
  ['ত', 'to'], ['থ', 'tho'], ['দ', 'do'], ['ধ', 'dho'], ['ন', 'no'], ['প', 'po'], ['ফ', 'pho'], ['ব', 'bo'], ['ভ', 'bho'], ['ম', 'mo'], ['য', 'jo'], ['য়', 'yo'],
  ['র', 'ro'], ['ল', 'lo'], ['শ', 'sho'], ['ষ', 'sho'], ['স', 'so'], ['হ', 'ho'], ['ং', 'ng'], ['ঃ', 'h'], ['ঁ', 'n'], ['া', 'a'], ['ি', 'i'], ['ী', 'ee'],
  ['ু', 'u'], ['ূ', 'oo'], ['ে', 'e'], ['ৈ', 'oi'], ['ো', 'o'], ['ৌ', 'ou'], ['্', ''],
  ['அ', 'a'], ['ஆ', 'aa'], ['இ', 'i'], ['ஈ', 'ee'], ['உ', 'u'], ['ஊ', 'oo'], ['எ', 'e'], ['ஏ', 'ae'], ['ஐ', 'ai'], ['ஒ', 'o'], ['ஓ', 'oa'], ['ஔ', 'au'],
  ['க', 'ka'], ['ங', 'nga'], ['ச', 'cha'], ['ஞ', 'nya'], ['ட', 'ta'], ['ண', 'na'], ['த', 'tha'], ['ந', 'na'], ['ப', 'pa'], ['ம', 'ma'], ['ய', 'ya'], ['ர', 'ra'],
  ['ல', 'la'], ['வ', 'va'], ['ழ', 'zha'], ['ள', 'la'], ['ற', 'ra'], ['ன', 'na'], ['ஜ', 'ja'], ['ஷ', 'sha'], ['ஸ', 'sa'], ['ஹ', 'ha'],
  ['ா', 'aa'], ['ி', 'i'], ['ீ', 'ee'], ['ு', 'u'], ['ூ', 'oo'], ['ெ', 'e'], ['ே', 'ae'], ['ை', 'ai'], ['ொ', 'o'], ['ோ', 'oa'], ['ௌ', 'au'], ['்', ''],
  ['ꯀ', 'ka'], ['ꯁ', 'sa'], ['ꯂ', 'la'], ['ꯃ', 'ma'], ['ꯄ', 'pa'], ['ꯅ', 'na'], ['ꯆ', 'cha'], ['ꯇ', 'ta'], ['ꯈ', 'kha'], ['ꯉ', 'nga'],
  ['ꯊ', 'tha'], ['ꯋ', 'wa'], ['ꯌ', 'ya'], ['ꯍ', 'ha'], ['ꯎ', 'u'], ['ꯏ', 'i'], ['ꯐ', 'pha'], ['ꯑ', 'a'], ['ꯒ', 'ga'], ['ꯔ', 'ra'],
  ['ꯕ', 'ba'], ['ꯖ', 'ja'], ['ꯗ', 'da'], ['ꯘ', 'gha'], ['ꯙ', 'dha'], ['ꯚ', 'bha'], ['ꯛ', 'k'], ['ꯜ', 'l'], ['ꯝ', 'm'], ['ꯞ', 'p'],
  ['ꯟ', 'n'], ['ꯠ', 't'], ['ꯡ', 'ng'], ['ꯢ', 'i'], ['ꯣ', 'o'], ['ꯤ', 'i'], ['ꯥ', 'a'], ['ꯦ', 'e'], ['ꯧ', 'ou'], ['ꯨ', 'u'], ['ꯩ', 'ei'],
]) as Record<string, string>;

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

function romanizeText(value: string) {
  return value
    .split('')
    .map((character) => SCRIPT_ROMANIZATION[character] ?? character)
    .join('')
    .replace(/\s+/g, ' ');
}

function romanizePageText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return /[^\u0000-\u007F]/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    node.nodeValue = romanizeText(node.nodeValue || '');
  });
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
    if (currentLanguage === 'en') return;

    const runRomanizer = window.setTimeout(romanizePageText, 700);
    const observer = new MutationObserver(() => {
      window.setTimeout(romanizePageText, 50);
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(runRomanizer);
      observer.disconnect();
    };
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
        return currentLanguage === 'en' ? dictionary[key] : romanizeText(dictionary[key]);
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
