import React from 'react';
import { Message, User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import TrashIcon from './icons/TrashIcon';

interface MessageOptionsMenuProps {
  message: Message;
  currentUser: User;
  onClose: () => void;
  onUnsend: () => void;
  onDeleteForMe: () => void;
}

const MessageOptionsMenu: React.FC<MessageOptionsMenuProps> = ({ message, currentUser, onClose, onUnsend, onDeleteForMe }) => {
  const { t } = useTranslation();
  const isMyMessage = message.senderId === currentUser.id;

  const handleUnsend = () => {
    onUnsend();
    onClose();
  };

  const handleDeleteForMe = () => {
    onDeleteForMe();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[101] flex justify-center items-end p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-2 divide-y divide-gray-100 dark:divide-neutral-700">
          {isMyMessage && (
            <button onClick={handleUnsend} className="w-full text-left flex items-center p-3 text-red-600 dark:text-red-500 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg">
                <TrashIcon className="w-5 h-5 me-3" />
                <span className="font-semibold">Unsend</span>
            </button>
          )}
          <button onClick={handleDeleteForMe} className="w-full text-left flex items-center p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg">
            <TrashIcon className="w-5 h-5 me-3" />
            <span className="font-semibold">Delete for me</span>
          </button>
        </div>
        <div className="p-2">
            <button onClick={onClose} className="w-full p-3 font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-neutral-700 rounded-lg">
              {t('cancel')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default MessageOptionsMenu;