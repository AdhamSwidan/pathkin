
import React from 'react';
import BackIcon from './icons/BackIcon';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <div className="sticky top-0 z-40 bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-lg border-b border-slate-200/60 dark:border-zinc-800/60 h-14 flex items-center justify-center w-full">
      {onBack && (
        <button onClick={onBack} className="absolute left-2 p-2 text-gray-600 dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange-light">
          <BackIcon />
        </button>
      )}
      <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      {rightAction && (
        <div className="absolute right-2 top-0 h-full flex items-center">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default Header;
