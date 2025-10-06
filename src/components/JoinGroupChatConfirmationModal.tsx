
import React from 'react';
import { HydratedAdventure } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface JoinGroupChatConfirmationModalProps {
  adventure: HydratedAdventure;
  onClose: () => void;
  onConfirm: (adventure: HydratedAdventure) => void;
}

const JoinGroupChatConfirmationModal: React.FC<JoinGroupChatConfirmationModalProps> = ({ adventure, onClose, onConfirm }) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm(adventure);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[101] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm flex flex-col p-6 text-center">
        <h2 className="text-xl font-bold dark:text-white mb-2">{t('joinGroupChatConfirmationTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('joinGroupChatConfirmationMessage')}
        </p>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 font-semibold"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleConfirm} 
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 font-semibold"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupChatConfirmationModal;
