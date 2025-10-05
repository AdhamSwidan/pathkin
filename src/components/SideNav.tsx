import React from 'react';
import { Screen } from '../types';
import HomeIcon from './icons/HomeIcon';
import MapIcon from './icons/MapIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import SearchIcon from './icons/SearchIcon';
import UserIcon from './icons/UserIcon';
import MessageIcon from './icons/MessageIcon';
import BellIcon from './icons/BellIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface SideNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  hasUnreadNotifications: boolean;
  isGuest: boolean;
  onGuestAction: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; disabled?: boolean; hasBadge?: boolean; }> = ({ icon, label, isActive, onClick, disabled = false, hasBadge = false }) => {
  const activeClasses = 'bg-orange-100 dark:bg-orange-900/40 text-brand-orange dark:text-brand-orange-light';
  const inactiveClasses = 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300';
  const disabledClasses = 'text-gray-400 dark:text-gray-600 cursor-not-allowed';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${disabled ? disabledClasses : (isActive ? activeClasses : inactiveClasses)}`}
    >
      <div className="w-6 h-6 me-4">{icon}</div>
      <span className="font-semibold">{label}</span>
      {hasBadge && (
        <span className="absolute top-3 end-3 block h-2 w-2 rounded-full bg-rose-500" />
      )}
    </button>
  );
};

const SideNav: React.FC<SideNavProps> = ({ activeScreen, setActiveScreen, hasUnreadNotifications, isGuest, onGuestAction }) => {
  const { t } = useTranslation();
  
  const handleNavItemClick = (screen: Screen, requiresAuth: boolean = false) => {
    if (isGuest && requiresAuth) {
      onGuestAction();
    } else {
      setActiveScreen(screen);
    }
  };

  const mainNavItems = [
    { screen: 'feed' as Screen, label: t('feed'), icon: <HomeIcon /> },
    { screen: 'map' as Screen, label: t('map'), icon: <MapIcon /> },
    { screen: 'search' as Screen, label: t('search'), icon: <SearchIcon /> },
    { screen: 'create' as Screen, label: t('adventure'), icon: <PlusCircleIcon />, requiresAuth: true },
  ];
  
   const secondaryNavItems = [
     { screen: 'profile' as Screen, label: t('profile'), icon: <UserIcon />, requiresAuth: true },
   ];

  return (
    <div className="w-64 border-e border-slate-200 dark:border-zinc-800 bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 flex-col justify-between hidden xl:flex">
        <div>
            <div className="flex items-center mb-8 px-2">
                <img src="/logo.svg" alt="Pathkin Logo" className="w-8 h-8 mr-2" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('appName')}</h1>
            </div>
            <nav>
            {mainNavItems.map((item) => (
                <NavItem
                key={item.screen}
                label={item.label}
                icon={item.icon}
                isActive={activeScreen === item.screen}
                onClick={() => handleNavItemClick(item.screen, item.requiresAuth)}
                disabled={isGuest && item.requiresAuth}
                />
            ))}
            <NavItem
                label={t('messages')}
                icon={<MessageIcon />}
                isActive={activeScreen === 'chat'}
                onClick={() => handleNavItemClick('chat', true)}
                disabled={isGuest}
            />
            <NavItem
                label={t('notifications')}
                icon={<BellIcon />}
                isActive={activeScreen === 'notifications'}
                onClick={() => handleNavItemClick('notifications', true)}
                disabled={isGuest}
                hasBadge={hasUnreadNotifications && !isGuest}
            />
            <div className="my-4 border-t border-slate-200 dark:border-zinc-800"></div>
            {secondaryNavItems.map((item) => (
                <NavItem
                key={item.screen}
                label={item.label}
                icon={item.icon}
                isActive={activeScreen === item.screen}
                onClick={() => handleNavItemClick(item.screen, item.requiresAuth)}
                disabled={isGuest && item.requiresAuth}
                />
            ))}
            </nav>
        </div>
         <div className="text-center text-xs text-gray-400">
            <p>&copy; 2025 Pathkin</p>
        </div>
    </div>
  );
};

export default SideNav;