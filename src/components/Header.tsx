import React from 'react';
import BackIcon from './icons/BackIcon';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  const hasLeftContent = onBack || title;

  return (
    <div className="sticky top-0 z-40 h-16 w-full p-3 flex items-center justify-between pointer-events-none">
      {hasLeftContent ? (
        <div className="flex items-center space-x-2 p-1 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 rounded-full backdrop-blur-lg shadow-md pointer-events-auto">
            {onBack && (
              <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full">
                <BackIcon />
              </button>
            )}
            <h1 className={`font-semibold text-gray-800 dark:text-gray-100 pr-3 ${!onBack ? 'pl-3' : ''}`}>{title}</h1>
        </div>
      ) : <div />} {/* Empty div to keep right action on the right */}
      
      {rightAction && (
        <div className="p-1 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 rounded-full backdrop-blur-lg shadow-md pointer-events-auto">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default Header;
