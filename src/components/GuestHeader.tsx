
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface GuestHeaderProps {
  onLoginClick: () => void;
}

const GuestHeader: React.FC<GuestHeaderProps> = ({ onLoginClick }) => {
  const { t } = useTranslation();
  return (
    <div className="sticky top-0 z-40 bg-slate-100/90 dark:bg-neutral-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800 h-14 flex items-center justify-between w-full px-4">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {t('guestHeader')}
      </p>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onLoginClick}
          className="text-sm px-3 py-1.5 rounded-md font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          {t('logIn')} / {t('signUp')}
        </button>
      </div>
    </div>
  );
};

export default GuestHeader;
