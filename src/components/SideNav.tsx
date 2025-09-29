
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
  onNotificationClick: () => void;
  hasUnreadNotifications: boolean;
  isGuest: boolean;
  onGuestAction: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; disabled?: boolean; }> = ({ icon, label, isActive, onClick, disabled = false }) => {
  const activeClasses = 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400';
  const inactiveClasses = 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300';
  const disabledClasses = 'text-gray-400 dark:text-gray-600 cursor-not-allowed';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${disabled ? disabledClasses : (isActive ? activeClasses : inactiveClasses)}`}
    >
      <div className="w-6 h-6 me-4">{icon}</div>
      <span className="font-semibold">{label}</span>
    </button>
  );
};

const SideNav: React.FC<SideNavProps> = ({ activeScreen, setActiveScreen, onNotificationClick, hasUnreadNotifications, isGuest, onGuestAction }) => {
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
    { screen: 'create' as Screen, label: t('post'), icon: <PlusCircleIcon />, requiresAuth: true },
  ];
  
   const secondaryNavItems = [
     { screen: 'profile' as Screen, label: t('profile'), icon: <UserIcon />, requiresAuth: true },
   ];

  return (
    <div className="w-64 border-e border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex-col justify-between hidden xl:flex">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8 px-2">{t('appName')}</h1>
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
             <button
                onClick={() => handleNavItemClick('chat', true)}
                disabled={isGuest}
                className={`relative flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${isGuest ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : (activeScreen === 'chat' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300')}`}
            >
                <div className="w-6 h-6 me-4"><MessageIcon /></div>
                <span className="font-semibold">{t('messages')}</span>
            </button>
             <button
                onClick={isGuest ? onGuestAction : onNotificationClick}
                disabled={isGuest}
                className={`relative flex items-center w-full p-3 my-1 rounded-lg ${isGuest ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300'}`}
            >
                <div className="w-6 h-6 me-4"><BellIcon /></div>
                <span className="font-semibold">{t('notifications')}</span>
                 {hasUnreadNotifications && !isGuest && (
                    <span className="absolute top-3 end-3 block h-2 w-2 rounded-full bg-rose-500" />
                )}
            </button>
            <div className="my-4 border-t border-gray-200 dark:border-neutral-800"></div>
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
            <p>&copy; 2024 WanderLodge</p>
        </div>
    </div>
  );
};

export default SideNav;
