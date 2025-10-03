

import React from 'react';
import { User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

// Props for the entire modal
interface FollowListModalProps {
  title: string;
  listOwner: User;
  currentUser: User | null;
  users: User[];
  listType: 'followers' | 'following';
  onClose: () => void;
  onViewProfile: (user: User) => void;
  onFollowToggle: (userId: string) => void;
  onRemoveFollower: (userId: string) => void;
}

// Props for the individual follow button
interface FollowButtonProps {
    userInList: User;
    listOwner: User;
    currentUser: User | null;
    listType: 'followers' | 'following';
    onFollowToggle: (userId: string) => void;
    onRemoveFollower: (userId: string) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
    userInList,
    listOwner,
    currentUser,
    listType,
    onFollowToggle,
    onRemoveFollower,
}) => {
    const { t } = useTranslation();
    if (!currentUser || userInList.id === currentUser.id) {
        return null;
    }

    // Fix: Add fallback for currentUser.following to prevent crash.
    const isFollowingThisUser = (currentUser.following || []).includes(userInList.id);

    // If I am viewing my own followers list, I can remove them.
    if (listOwner.id === currentUser.id && listType === 'followers') {
        return (
            <button
                onClick={() => onRemoveFollower(userInList.id)}
                className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 px-4 py-1 rounded-md font-semibold text-sm"
            >
                {t('remove')}
            </button>
        );
    }
    
    // In any other list (my following list, or anyone else's lists), I see a Follow/Following button.
    return (
        <button
            onClick={() => onFollowToggle(userInList.id)}
            className={`px-4 py-1 rounded-md font-semibold text-sm w-24 text-center ${
                isFollowingThisUser
                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
        >
            {isFollowingThisUser ? t('following') : t('follow')}
        </button>
    );
};


const FollowListModal: React.FC<FollowListModalProps> = ({ 
    title,
    listOwner,
    currentUser,
    users, 
    listType,
    onClose, 
    onViewProfile,
    onFollowToggle,
    onRemoveFollower
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[101] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 h-14 flex items-center justify-center border-b border-gray-200 dark:border-neutral-800 relative">
          <h2 className="text-lg font-bold dark:text-white">{title}</h2>
          <button onClick={onClose} className="absolute end-2 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">
            &times;
          </button>
        </div>
        
        {/* User List */}
        <div className="overflow-y-auto flex-grow">
          {users.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className="p-3 flex items-center justify-between"
                >
                  <button 
                      onClick={() => onViewProfile(user)} 
                      className="flex items-center space-x-4 text-left"
                  >
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                  </button>
                  <FollowButton 
                      userInList={user}
                      listOwner={listOwner}
                      currentUser={currentUser}
                      listType={listType}
                      onFollowToggle={onFollowToggle}
                      onRemoveFollower={onRemoveFollower}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">{t('noUsersToDisplay')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;