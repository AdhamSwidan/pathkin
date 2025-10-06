
import React from 'react';
import { User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import MessageIcon from './icons/MessageIcon';
import BellIcon from './icons/BellIcon';

interface TopHeaderProps {
  currentUser: User;
  isGuest: boolean;
  onGuestAction: () => void;
  onNavigateToSearch: () => void;
  onNavigateToChat: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToProfile: () => void;
  hasUnreadNotifications: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  isGuest,
  onGuestAction,
  onNavigateToSearch,
  onNavigateToChat,
  onNavigateToNotifications,
  onNavigateToProfile,
  hasUnreadNotifications,
}) => {
  const { t } = useTranslation();

  const handleActionClick = (action: () => void) => {
    if (isGuest) {
      onGuestAction();
    } else {
      action();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-lg border-b border-slate-200/60 dark:border-zinc-800/60 h-14 flex items-center justify-between px-4">
      {/* Left Group */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onNavigateToSearch}
          className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 rounded-full py-2 px-3 transition-colors"
        >
          <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('search')}</span>
        </button>
      </div>

      {/* Right Group */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => handleActionClick(onNavigateToChat)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-gray-200 transition-colors"
          aria-label={t('messages')}
        >
          <MessageIcon />
        </button>
        <button
          onClick={() => handleActionClick(onNavigateToNotifications)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-gray-200 transition-colors"
          aria-label={t('notifications')}
        >
          <BellIcon />
          {hasUnreadNotifications && !isGuest && (
            <span className="absolute top-1.5 end-1.5 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-light-bg-secondary dark:ring-dark-bg-secondary" />
          )}
        </button>
        <button
          onClick={() => handleActionClick(onNavigateToProfile)}
          className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange dark:focus:ring-offset-dark-bg-secondary"
          aria-label={t('profile')}
        >
          <img src={currentUser.avatarUrl} alt="Your avatar" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;