import React, { useState } from 'react';
import Header from './Header';
import ToggleSwitch from './ToggleSwitch';
import { User, PrivacySettings } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface PrivacySecurityScreenProps {
  onBack: () => void;
  currentUser: User;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
}

const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onBack, currentUser, onUpdateProfile }) => {
  const [isPrivate, setIsPrivate] = useState(currentUser.isPrivate);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(currentUser.privacySettings);
  const { t } = useTranslation();
  
  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    onUpdateProfile({
      isPrivate,
      privacySettings,
    });
  };

  const PrivacyItem: React.FC<{ label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; }> = 
  ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex-grow text-left pe-4">
            <span className="text-base text-gray-800 dark:text-white">{label}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <ToggleSwitch initialChecked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={t('privacySecurity')} onBack={onBack} />
      <div className="flex-grow overflow-y-auto">
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('accountPrivacy')}</h2>
        </div>
        <div className="bg-white dark:bg-neutral-900 mx-4 rounded-lg border border-gray-200 dark:border-neutral-800">
           <PrivacyItem 
             label={t('privateAccount')}
             description={t('privateAccountDescription')}
             checked={isPrivate}
             onChange={setIsPrivate}
           />
        </div>

        <div className="px-4 pt-6 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('profileVisibility')}</h2>
        </div>
        <div className="bg-white dark:bg-neutral-900 mx-4 rounded-lg divide-y divide-gray-200 dark:divide-neutral-700/50 border border-gray-200 dark:border-neutral-800">
           <PrivacyItem 
             label={t('showFollowLists')}
             description={t('showFollowListsDescription')}
             checked={privacySettings.showFollowLists}
             onChange={(val) => handleToggle('showFollowLists', val)}
           />
           <PrivacyItem 
             label={t('showStats')}
             description={t('showStatsDescription')}
             checked={privacySettings.showStats}
             onChange={(val) => handleToggle('showStats', val)}
           />
           <PrivacyItem 
             label={t('showCompletedActivities')}
             description={t('showCompletedActivitiesDescription')}
             checked={privacySettings.showCompletedActivities}
             onChange={(val) => handleToggle('showCompletedActivities', val)}
           />
           <PrivacyItem 
             label={t('appearInTwinSearch')}
             description={t('appearInTwinSearchDescription')}
             checked={privacySettings.allowTwinSearch}
             onChange={(val) => handleToggle('allowTwinSearch', val)}
           />
        </div>
      </div>
       <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <button onClick={handleSaveChanges} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
};

export default PrivacySecurityScreen;
