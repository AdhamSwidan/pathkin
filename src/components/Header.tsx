import React from 'react';
import BackIcon from './icons/BackIcon';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  avatarUrl?: string;
  onTitleClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, avatarUrl, onTitleClick }) => {
  const hasLeftContent = onBack || title || avatarUrl;

  return (
    <div className="sticky top-0 z-40 h-16 w-full p-3 flex items-center justify-between pointer-events-none">
      <div className="flex-1 min-w-0">
        {hasLeftContent && (
          <div className="p-1 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 rounded-full backdrop-blur-lg shadow-md pointer-events-auto flex items-center space-x-2 w-max">
            {onBack && (
              <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full flex-shrink-0">
                <BackIcon />
              </button>
            )}
            {avatarUrl && (
              <button onClick={onTitleClick} disabled={!onTitleClick} className="flex-shrink-0 disabled:cursor-default">
                <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
              </button>
            )}
            {title && (
              <h1 className="font-semibold text-gray-800 dark:text-gray-100 truncate pr-3">
                  {title}
              </h1>
            )}
          </div>
        )}
      </div>
      
      {rightAction && (
        <div className="p-1 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 rounded-full backdrop-blur-lg shadow-md pointer-events-auto flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default Header;