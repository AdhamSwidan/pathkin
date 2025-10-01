import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the props for the provider
interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('language') || 'en');
  // Initialize translations to null. This will act as our loading state.
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Vite serves files from the `public` directory at the root.
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Fallback to English if loading fails
        if (language !== 'en') {
            try {
                const fallbackResponse = await fetch(`/locales/en.json`);
                const fallbackData = await fallbackResponse.json();
                setTranslations(fallbackData);
            } catch (fallbackError) {
                console.error("Failed to load fallback translations:", fallbackError);
                setTranslations({});
            }
        } else {
             // If even english fails, set to empty object to unblock rendering.
             setTranslations({});
        }
      }
    };

    fetchTranslations();
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };
  
  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    // Guard against translations being null during the initial load.
    let translation = translations?.[key] || key;
    
    if (options && translations) {
      Object.keys(options).forEach((optionKey) => {
        const regex = new RegExp(`{{${optionKey}}}`, 'g');
        translation = translation.replace(regex, String(options[optionKey]));
      });
    }

    // Handle pluralization for "foundTwins"
    if (key.startsWith('foundTwins') && options && typeof options.count === 'number' && translations) {
        if (options.count !== 1) {
            return translations[`${key}_plural`]?.replace('{{count}}', String(options.count)) || key;
        }
    }

    return translation;
  }, [translations]);

  // If translations haven't been loaded yet, render a loading screen.
  // This is the crucial part that prevents showing untranslated keys.
  if (translations === null) {
    return (
        <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
