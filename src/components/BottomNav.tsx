

import React from 'react';
import { Screen } from '../types';
import HomeIcon from './icons/HomeIcon';
import MapIcon from './icons/MapIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import SearchIcon from './icons/SearchIcon';
import UserIcon from './icons/UserIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  isGuest: boolean;
  onGuestAction: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; disabled?: boolean; }> = ({ icon, label, isActive, onClick, disabled = false }) => {
  const activeColor = 'text-brand-orange dark:text-brand-orange-light';
  const inactiveColor = 'text-gray-500 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange-light';
  const disabledColor = 'text-gray-300 dark:text-gray-600 cursor-not-allowed';
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 relative pt-1 ${disabled ? disabledColor : (isActive ? activeColor : inactiveColor)}`} disabled={disabled}>
      <div className={`transition-all duration-300 absolute top-1/2 -translate-y-1/2 w-16 h-8 rounded-full ${isActive ? 'bg-orange-100 dark:bg-orange-900/40 opacity-100' : 'opacity-0'}`}></div>
      <div className="relative z-10">{icon}</div>
      <span className="text-xs mt-1 relative z-10">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, isGuest, onGuestAction }) => {
  const { t } = useTranslation();
  
  const handleNavItemClick = (screen: Screen) => {
    // These screens require login
    if (isGuest && ['create', 'profile'].includes(screen)) {
      onGuestAction();
    } else {
      setActiveScreen(screen);
    }
  };

  const navItems = [
    { screen: 'feed' as Screen, label: t('feed'), icon: <HomeIcon /> },
    { screen: 'map' as Screen, label: t('map'), icon: <MapIcon /> },
    { screen: 'create' as Screen, label: t('adventure'), icon: <PlusCircleIcon className="w-8 h-8" />, requiresAuth: true },
    { screen: 'search' as Screen, label: t('search'), icon: <SearchIcon /> },
    { screen: 'profile' as Screen, label: t('profile'), icon: <UserIcon />, requiresAuth: true },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex justify-center">
      <div className="w-full max-w-2xl bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-sm border-t border-gray-200 dark:border-neutral-800 flex items-center justify-around">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            label={item.label}
            icon={item.icon}
            isActive={activeScreen === item.screen}
            onClick={() => handleNavItemClick(item.screen)}
            disabled={isGuest && item.requiresAuth}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNav;