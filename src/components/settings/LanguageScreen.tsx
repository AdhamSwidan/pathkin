import React from 'react';
import Header from '../Header';
import { useTranslation } from '../../contexts/LanguageContext';

interface LanguageScreenProps {
  onBack: () => void;
}

const languages = [
    { code: 'en', name: 'english' },
    { code: 'ar', name: 'arabic' },
];

const LanguageScreen: React.FC<LanguageScreenProps> = ({ onBack }) => {
    const { t, language, setLanguage } = useTranslation();

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
            <Header title={t('language')} onBack={onBack} />
            <div className="flex-grow overflow-y-auto">
                <div className="bg-white dark:bg-neutral-900 mx-4 mt-6 rounded-lg border border-gray-200 dark:border-neutral-800">
                    {languages.map((lang, index) => (
                        <React.Fragment key={lang.code}>
                            <button
                                onClick={() => setLanguage(lang.code)}
                                className="w-full flex items-center justify-between p-4 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                            >
                                <span>{t(lang.name)}</span>
                                {language === lang.code && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 dark:text-orange-400">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                            {index < languages.length - 1 && <div className="border-t border-gray-200 dark:border-neutral-700/50"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageScreen;