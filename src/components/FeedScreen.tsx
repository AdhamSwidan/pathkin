import React, { useState, useMemo } from 'react';
import { User, HydratedAdventure, HydratedStory, AdventureType } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import StoryReel from './StoryReel';
import BellIcon from './icons/BellIcon';
import MessageIcon from './icons/MessageIcon';
import { useTranslation } from '../contexts/LanguageContext';
import AdventureTypeFilterBar from './AdventureTypeFilterBar';

interface FeedScreenProps {
  adventures: HydratedAdventure[];
  stories: HydratedStory[];
  currentUser: User;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onSelectStories: (stories: HydratedStory[]) => void;
  onAddStory: () => void;
  onNotificationClick: () => void;
  hasUnreadNotifications: boolean;
  onNavigateToChat: () => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  isGuest: boolean;
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ 
  adventures, 
  stories, 
  currentUser, 
  onSelectAdventure, 
  onSendMessage, 
  onToggleInterest, 
  onSelectStories,
  onAddStory,
  onNotificationClick,
  hasUnreadNotifications,
  onNavigateToChat,
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareAdventure,
  onToggleCompleted,
  isGuest,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
}) => {
  const { t } = useTranslation();
  const [selectedAdventureType, setSelectedAdventureType] = useState<AdventureType | 'all'>('all');

  const filteredAdventures = useMemo(() => {
    if (selectedAdventureType === 'all') {
      return adventures;
    }
    return adventures.filter(adventure => adventure.type === selectedAdventureType);
  }, [adventures, selectedAdventureType]);

  const headerActions = (
    <div className="flex items-center space-x-2">
      <button onClick={onNavigateToChat} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 relative">
        <MessageIcon />
      </button>
      <button onClick={onNotificationClick} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 relative">
        <BellIcon />
        {hasUnreadNotifications && (
          <span className="absolute top-1 end-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-950" />
        )}
      </button>
    </div>
  );

  return (
    <>
      <Header 
        title={t('appName')}
        rightAction={headerActions}
      />
      <StoryReel stories={stories} currentUser={currentUser} onSelectStories={onSelectStories} onAddStory={onAddStory} />
      
      <AdventureTypeFilterBar 
        selectedType={selectedAdventureType} 
        onSelectType={setSelectedAdventureType} 
      />

      <div className="px-2 pt-2">
        {filteredAdventures.map(adventure => (
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
        {filteredAdventures.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('noAdventuresToShow')}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{selectedAdventureType === 'all' ? t('checkPrivacySettings') : t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedScreen;