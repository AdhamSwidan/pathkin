
import React from 'react';
import BackIcon from './icons/BackIcon';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800 h-14 flex items-center justify-center w-full">
      {onBack && (
        <button onClick={onBack} className="absolute left-2 p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
          <BackIcon />
        </button>
      )}
      <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      {rightAction && (
        <div className="absolute right-2">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default Header;
