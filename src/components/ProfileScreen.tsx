import React, { useMemo } from 'react';
import { User, HydratedAdventure, ActivityStatus, AdventureType, ProfileTab, HydratedStory } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import GridIcon from './icons/GridIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import RepostIcon from './icons/RepostIcon';
import ShareIcon from './icons/ShareIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import BarChartIcon from './icons/BarChartIcon';
import StatsScreen from './StatsScreen';
import StarIcon from './icons/StarIcon';
import SettingsIcon from './icons/SettingsIcon';
import { useTranslation } from '../contexts/LanguageContext';
import UserIcon from './icons/UserIcon';
import { getFlagUrl } from '../utils/countryUtils';
import PlusIcon from './icons/PlusIcon';


interface ProfileScreenProps {
  user: User;
  allAdventures: HydratedAdventure[];
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareProfile: (user: User) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  onOpenFollowList: (user: User, listType: 'followers' | 'following') => void;
  onNavigateToSettings: () => void;
  onViewLocationOnMap: (adventure: HydratedAdventure | null) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
  onJoinGroupChat: (adventure: HydratedAdventure) => void;
  onViewCompletedByType: (user: User, type: AdventureType) => void;
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  // Fix: Add missing story-related props to resolve TypeScript errors.
  stories: HydratedStory[];
  onSelectStories: (stories: HydratedStory[]) => void;
  onAddStory: () => void;
  viewedStoryTimestamps: Record<string, string>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  allAdventures,
  onSelectAdventure, 
  onSendMessage, 
  onToggleInterest, 
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareProfile,
  onShareAdventure,
  onToggleCompleted,
  onOpenFollowList,
  onNavigateToSettings,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
  onJoinGroupChat,
  onViewCompletedByType,
  activeTab,
  setActiveTab,
  stories,
  onSelectStories,
  onAddStory,
  viewedStoryTimestamps,
}) => {
  const { t } = useTranslation();

  const { myStories, hasUnviewedStories } = useMemo(() => {
    const userStories = stories.filter(s => s.authorId === user.id);
    if (userStories.length === 0) {
      return { myStories: [], hasUnviewedStories: false };
    }
    const lastViewed = viewedStoryTimestamps[user.id];
    const latestStory = userStories.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    const hasUnviewed = !lastViewed || new Date(latestStory.createdAt) > new Date(lastViewed);
    
    const sortedStories = userStories.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return { myStories: sortedStories, hasUnviewedStories: hasUnviewed };
  }, [stories, user.id, viewedStoryTimestamps]);

  const headerActions = (
    <div className="flex items-center space-x-2">
      <button onClick={() => onShareProfile(user)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
        <ShareIcon />
      </button>
      <button onClick={onNavigateToSettings} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
        <SettingsIcon />
      </button>
    </div>
  );
  
  const { userAdventures, savedAdventures, repostedAdventures, completedAdventures } = useMemo(() => {
    const userAdventures = allAdventures.filter(p => p.author.id === user.id);
    // Fix: Add fallbacks for user array properties to prevent crashes.
    const savedAdventures = allAdventures.filter(p => (user.savedAdventures || []).includes(p.id));
    const repostedAdventures = allAdventures.filter(p => (user.repostedAdventures || []).includes(p.id));
    const completedAdventures = allAdventures.filter(p => (user.activityLog || []).some(a => a.adventureId === p.id && a.status === ActivityStatus.Confirmed));
    return { userAdventures, savedAdventures, repostedAdventures, completedAdventures };
  }, [allAdventures, user]);
  
  const renderedAdventures = useMemo(() => {
    if (activeTab === 'saved') return savedAdventures;
    if (activeTab === 'reposts') return repostedAdventures;
    if (activeTab === 'completed') return completedAdventures;
    return userAdventures;
  }, [activeTab, userAdventures, savedAdventures, repostedAdventures, completedAdventures]);

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
    if (activeTab === 'stats') {
      return <StatsScreen user={user} allAdventures={allAdventures} onViewCompletedByType={(type) => onViewCompletedByType(user, type)} />;
    }

    return (
      <div className="pt-2 px-2">
           {renderedAdventures.map(adventure => (
              <AdventureCard 
                key={adventure.id} 
                adventure={adventure} 
                currentUser={user}
                isGuest={false}
                // Fix: Pass missing story-related props to AdventureCard.
                stories={stories}
                viewedStoryTimestamps={viewedStoryTimestamps}
                onSelectStories={onSelectStories}
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
                // Fix: Pass the onJoinGroupChat prop to AdventureCard to fix missing prop error.
                onJoinGroupChat={onJoinGroupChat}
              />
            ))}
             {renderedAdventures.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noAdventuresInSection')}</p>
             )}
      </div>
    );
  };

  const flagUrl = user.country ? getFlagUrl(user.country) : null;

  return (
    <>
      <Header rightAction={headerActions} />
      <div className="flex-grow">
        <div className="w-full h-32 bg-gray-200 dark:bg-neutral-800">
            {user.coverUrl ? (
                <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-800 dark:to-neutral-700"></div>
            )}
        </div>
        
        <div className="px-4 relative">
          <div className="flex items-end">
             <div className="relative w-24 h-24 flex-shrink-0 -mt-12">
              <div 
                className={`w-full h-full rounded-full border-4 border-light-bg dark:border-dark-bg shadow-lg ${myStories.length > 0 ? 'p-0.5' : ''} ${hasUnviewedStories ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600' : (myStories.length > 0 ? 'bg-gray-300 dark:bg-neutral-700' : '')}`}
              >
                <button
                  onClick={() => myStories.length > 0 && onSelectStories(myStories)}
                  className="w-full h-full rounded-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center overflow-hidden"
                  aria-label={myStories.length > 0 ? "View story" : "No story to view"}
                >
                  {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                      <UserIcon className="w-12 h-12 text-white dark:text-neutral-950" />
                  )}
                </button>
              </div>

              <button
                onClick={onAddStory}
                className="absolute bottom-0 end-0 bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-light-bg dark:border-dark-bg hover:bg-brand-orange-light transition-colors"
                aria-label={t('addStory')}
              >
                <PlusIcon strokeWidth="3" className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-grow ms-4 flex items-center">
                <div className="flex justify-around w-full">
                    <div className="text-center">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{userAdventures.length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('adventures')}</p>
                    </div>
                    <button className="text-center" onClick={() => onOpenFollowList(user, 'followers')}>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{(user.followers || []).length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('followers')}</p>
                    </button>
                    <button className="text-center" onClick={() => onOpenFollowList(user, 'following')}>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{(user.following || []).length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('following')}</p>
                    </button>
                </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 px-4">
            <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
                {flagUrl && <img src={flagUrl} alt={`${user.country} flag`} className="w-6 h-auto rounded-sm" />}
                {user.averageRating && (
                    <div className="flex items-center space-x-1 text-amber-500 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                        <StarIcon className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{user.averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{user.bio}</p>
        </div>
        
        <div className="mt-4 border-t border-b border-gray-200 dark:border-neutral-800 flex">
          <TabButton tab="adventures" icon={<GridIcon />} />
          <TabButton tab="saved" icon={<BookmarkIcon />} />
          <TabButton tab="reposts" icon={<RepostIcon />} />
          <TabButton tab="completed" icon={<CheckCircleIcon />} />
          <TabButton tab="stats" icon={<BarChartIcon />} />
        </div>
        
        {renderContent()}
      </div>
    </>
  );
};

export default ProfileScreen;
