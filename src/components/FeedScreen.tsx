import React, { useState, useMemo } from 'react';
import { User, HydratedAdventure, HydratedStory, AdventureType } from '../types';
import AdventureCard from './AdventureCard';
import StoryReel from './StoryReel';
import { useTranslation } from '../contexts/LanguageContext';
import AdventureTypeFilterBar from './AdventureTypeFilterBar';
import TopHeader from './TopHeader';

interface FeedScreenProps {
  adventures: HydratedAdventure[];
  stories: HydratedStory[];
  currentUser: User;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onSelectStories: (stories: HydratedStory[]) => void;
  onAddStory: () => void;
  onNavigateToNotifications: () => void;
  hasUnreadNotifications: boolean;
  onNavigateToChat: () => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: () => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  isGuest: boolean;
  onGuestAction: () => void;
  onViewLocationOnMap: (adventure: HydratedAdventure | null) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
  onJoinGroupChat: (adventure: HydratedAdventure) => void;
  viewedStoryTimestamps: Record<string, string>;
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
  onNavigateToNotifications,
  hasUnreadNotifications,
  onNavigateToChat,
  onNavigateToSearch,
  onNavigateToProfile,
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareAdventure,
  onToggleCompleted,
  isGuest,
  onGuestAction,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
  onJoinGroupChat,
  viewedStoryTimestamps,
}) => {
  const { t } = useTranslation();
  const [selectedAdventureType, setSelectedAdventureType] = useState<AdventureType | 'all'>('all');

  const filteredAdventures = useMemo(() => {
    if (selectedAdventureType === 'all') {
      return adventures;
    }
    return adventures.filter(adventure => adventure.type === selectedAdventureType);
  }, [adventures, selectedAdventureType]);

  return (
    <>
      <TopHeader
        currentUser={currentUser}
        isGuest={isGuest}
        onGuestAction={onGuestAction}
        hasUnreadNotifications={hasUnreadNotifications}
        onNavigateToChat={onNavigateToChat}
        onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSearch={onNavigateToSearch}
      />
      <div className="space-y-3">
        <StoryReel 
          stories={stories} 
          currentUser={currentUser} 
          onSelectStories={onSelectStories} 
          onAddStory={onAddStory}
          viewedStoryTimestamps={viewedStoryTimestamps}
        />
        
        <AdventureTypeFilterBar 
          selectedType={selectedAdventureType} 
          onSelectType={setSelectedAdventureType} 
        />
      </div>

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
            onJoinGroupChat={onJoinGroupChat}
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