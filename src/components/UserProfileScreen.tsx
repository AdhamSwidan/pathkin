import React, { useState, useMemo } from 'react';
import { User, ActivityStatus, HydratedAdventure } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import GridIcon from './icons/GridIcon';
import RepostIcon from './icons/RepostIcon';
import ShareIcon from './icons/ShareIcon';
import BarChartIcon from './icons/BarChartIcon';
import StatsScreen from './StatsScreen';
import StarIcon from './icons/StarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import LockIcon from './icons/LockIcon';
import { useTranslation } from '../contexts/LanguageContext';
import UserIcon from './icons/UserIcon';

interface UserProfileScreenProps {
  user: User;
  currentUser: User;
  allAdventures: HydratedAdventure[];
  onBack: () => void;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareProfile: (user: User) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  onOpenFollowList: (user: User, listType: 'followers' | 'following') => void;
  isGuest: boolean;
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
}

type ProfileTab = 'adventures' | 'reposts' | 'completed' | 'stats';

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ 
  user, 
  currentUser, 
  allAdventures,
  onBack, 
  onSelectAdventure, 
  onSendMessage, 
  onToggleInterest,
  onFollowToggle,
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareProfile,
  onShareAdventure,
  onToggleCompleted,
  onOpenFollowList,
  isGuest,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('adventures');
  const { t } = useTranslation();

  const isFollowing = (currentUser.following || []).includes(user.id);
  const canViewProfile = !user.isPrivate || (isFollowing && !isGuest);

  const headerActions = (
    <button onClick={() => onShareProfile(user)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
      <ShareIcon />
    </button>
  );

  const { userAdventures, repostedAdventures, completedAdventures } = useMemo(() => {
    // Determine which adventures are visible to the current user
    const visibleUserAdventures = allAdventures.filter(adventure => {
        if (adventure.author.id !== user.id) return false;
        
        // If profile is private, only followers can see adventures, respecting adventure-level privacy
        if(user.isPrivate && !isFollowing && !isGuest) return false;
        if(user.isPrivate && isGuest) return false;

        if (adventure.privacy === 'Public') return true;
        if(isGuest) return false; // Guests only see public adventures

        if (adventure.privacy === 'Followers' && isFollowing) return true;
        if (adventure.privacy === 'Twins' && currentUser.birthday && user.birthday && currentUser.birthday.substring(5) === user.birthday.substring(5)) return true;
        return false;
    });

    const repostedAdventures = allAdventures.filter(p => (user.repostedAdventures || []).includes(p.id));
    const completedAdventures = allAdventures.filter(p => 
        (user.activityLog || []).some(a => a.adventureId === p.id && a.status === ActivityStatus.Confirmed)
    );
    return { userAdventures: visibleUserAdventures, repostedAdventures, completedAdventures };
  }, [allAdventures, user, currentUser, isFollowing, isGuest]);

  const renderedAdventures = useMemo(() => {
    if (activeTab === 'reposts') return repostedAdventures;
    if (activeTab === 'completed') return completedAdventures;
    return userAdventures;
  }, [activeTab, userAdventures, repostedAdventures, completedAdventures]);

  const TabButton: React.FC<{ tab: ProfileTab; icon: React.ReactNode; }> = ({ tab, icon }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-3 flex justify-center items-center border-b-2 transition-colors duration-200 ${
          isActive ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-orange-500'
        }`}
      >
        {icon}
      </button>
    )
  };

  const renderContent = () => {
    if (!canViewProfile) {
        return (
            <div className="text-center py-16 px-4">
                <LockIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{t('thisAccountIsPrivate')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('followToSeePosts')}</p>
            </div>
        );
    }
    if (activeTab === 'stats') {
      return <StatsScreen user={user} allAdventures={allAdventures} />;
    }

    return (
      <div className="mt-4 px-2">
        <div className="space-y-4">
           {renderedAdventures.map(adventure => (
              <AdventureCard 
                key={adventure.id} 
                adventure={adventure} 
                currentUser={currentUser}
                isGuest={isGuest}
                onCommentClick={onSelectAdventure}
                onMessageClick={onSendMessage}
                onInterestToggle={onToggleInterest}
                onViewProfile={onViewProfile}
                onRepostToggle={onRepostToggle}
                onSaveToggle={onSaveToggle}
                onShareAdventure={onShareAdventure}
                onToggleCompleted={onToggleCompleted}
                onViewLocationOnMap={onViewLocationOnMap}
                onDeleteAdventure={onDeleteAdventure}
                onEditAdventure={onEditAdventure}
              />
            ))}
             {renderedAdventures.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noAdventuresInSection')}</p>
             )}
        </div>
      </div>
    );
  };

  const baseButtonClasses = "px-2 py-1 rounded-md font-semibold text-sm transition-colors";
  const primaryButtonClasses = "bg-orange-500 text-white hover:bg-orange-600";
  const secondaryButtonClasses = "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600";

  return (
    <>
      <Header title={user.name} onBack={onBack} rightAction={headerActions} />
      <div className="bg-white dark:bg-neutral-950 flex-grow">
        {/* Cover Photo */}
        <div className="w-full h-32 bg-gray-200 dark:bg-neutral-800">
          {user.coverUrl ? (
            <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-800 dark:to-neutral-700"></div>
          )}
        </div>
        
        {/* Profile Header */}
        <div className="px-4 relative">
          <div className="flex items-end">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-950 shadow-lg flex-shrink-0 -mt-12 bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-white dark:text-neutral-950" />
              )}
            </div>
            
            {/* Stats */}
            <div className="flex-grow ms-4 flex items-center">
              <div className="flex justify-around w-full">
                  <div className="text-center">
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{userAdventures.length}</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('adventures')}</p>
                  </div>
                  <button className="text-center disabled:cursor-default" onClick={() => onOpenFollowList(user, 'followers')} disabled={!canViewProfile || !user.privacySettings.showFollowLists}>
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{canViewProfile && user.privacySettings.showFollowLists ? (user.followers || []).length : '-'}</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('followers')}</p>
                  </button>
                  <button className="text-center disabled:cursor-default" onClick={() => onOpenFollowList(user, 'following')} disabled={!canViewProfile || !user.privacySettings.showFollowLists}>
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{canViewProfile && user.privacySettings.showFollowLists ? (user.following || []).length : '-'}</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('following')}</p>
                  </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="pt-4 px-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2 mr-2 flex-shrink min-w-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">{user.name}</h2>
                     {user.averageRating && (
                        <div className="flex items-center space-x-1 text-amber-500 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full flex-shrink-0">
                            <StarIcon className="w-4 h-4 fill-current" />
                            <span className="font-bold text-sm">{user.averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2 flex-shrink-0 mt-1">
                    <button
                      onClick={() => onFollowToggle(user.id)}
                      disabled={isGuest}
                      className={`${baseButtonClasses} w-20 text-center ${isFollowing ? secondaryButtonClasses : primaryButtonClasses} ${isGuest ? 'cursor-not-allowed' : ''}`}
                    >
                      {isFollowing ? t('following') : t('follow')}
                    </button>
                     <button
                      onClick={() => onSendMessage(user)}
                      disabled={isGuest}
                      className={`${baseButtonClasses} w-20 text-center ${secondaryButtonClasses} ${isGuest ? 'cursor-not-allowed' : ''}`}
                    >
                      {t('message')}
                    </button>
                  </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">{user.bio}</p>
        </div>
        
        {/* Tabs */}
        {canViewProfile &&
            <div className="mt-4 border-t border-b border-gray-200 dark:border-neutral-800 flex">
                <TabButton tab="adventures" icon={<GridIcon />} />
                <TabButton tab="reposts" icon={<RepostIcon />} />
                {user.privacySettings.showCompletedActivities && <TabButton tab="completed" icon={<CheckCircleIcon />} />}
                {user.privacySettings.showStats && <TabButton tab="stats" icon={<BarChartIcon />} />}
            </div>
        }

        {renderContent()}
      </div>
    </>
  );
};

export default UserProfileScreen;
