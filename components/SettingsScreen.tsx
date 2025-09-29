


import React from 'react';
import Header from './Header';
import EditIcon from './icons/EditIcon';
import LogoutIcon from './icons/LogoutIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ShieldIcon from './icons/ShieldIcon';
import LanguageIcon from './icons/LanguageIcon';
import { Screen } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-4 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:hover:bg-transparent" disabled={!onClick}>
    <div className="text-orange-500 dark:text-orange-400 mr-4">{icon}</div>
    <div className="flex-grow text-left">
        <span className="text-base">{label}</span>
    </div>
    <div className="text-gray-400 dark:text-gray-500">
        {onClick && label !== 'Log Out' && label !== 'تسجيل الخروج' && <ChevronRightIcon />}
    </div>
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate, onLogout }) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={t('settings')} onBack={onBack} />
      <div className="flex-grow overflow-y-auto">
        
        <div className="bg-white dark:bg-neutral-900 mx-4 mt-6 rounded-lg divide-y divide-gray-200 dark:divide-neutral-700/50 border border-gray-200 dark:border-neutral-800">
          <SettingsItem 
            icon={<EditIcon />} 
            label={t('editProfile')} 
            onClick={() => onNavigate('editProfile')}
          />
           <SettingsItem 
            icon={<ShieldIcon />} 
            label={t('privacySecurity')} 
            onClick={() => onNavigate('privacySecurity')}
          />
           <SettingsItem 
            icon={<LanguageIcon />} 
            label={t('language')} 
            onClick={() => onNavigate('language')}
          />
          <SettingsItem 
            icon={<LogoutIcon />} 
            label={t('logOut')} 
            onClick={onLogout}
          />
        </div>

      </div>
    </div>
  );
};

export default SettingsScreen;