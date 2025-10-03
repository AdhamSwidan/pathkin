import React, { useEffect, useRef } from 'react';
import { HydratedPost } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import EditIcon from './icons/EditIcon';

interface PostOptionsMenuProps {
  post: HydratedPost;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({ post, onClose, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDeleteClick = () => {
    if (window.confirm(t('confirmDelete'))) {
        onDelete();
    }
  };

  return (
    <div 
        ref={menuRef}
        className="absolute top-full end-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-gray-200 dark:border-neutral-700 z-10 animate-fade-in"
    >
      <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
        <li>
          <button
            onClick={onEdit}
            className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            <EditIcon className="w-4 h-4 me-2" />
            {t('editPost')}
          </button>
        </li>
        <li>
          <button
            onClick={handleDeleteClick}
            className="w-full text-left flex items-center px-4 py-2 text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            <TrashIcon className="w-4 h-4 me-2" />
            {t('deletePost')}
          </button>
        </li>
      </ul>
    </div>
  );
};

// This icon is created locally as it's only used here.
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);


export default PostOptionsMenu;