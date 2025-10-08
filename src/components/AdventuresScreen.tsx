import React, { useState, useMemo } from 'react';
import { User, HydratedAdventure, HydratedStory, AdventureType } from '../types';
import AdventureCard from './AdventureCard';
import { useTranslation } from '../contexts/LanguageContext';
import AdventureTypeFilterBar from './AdventureTypeFilterBar';
import TopHeader from './TopHeader';
import CalendarIcon from './icons/CalendarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface AdventuresScreenProps {
  adventures: HydratedAdventure[];
  stories: HydratedStory[];
  currentUser: User;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onSelectStories: (stories: HydratedStory[]) => void;
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

const TimeFilterButton: React.FC<{
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-white dark:bg-zinc-700 text-brand-orange shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/20'
      }`}
    >
      {icon && <span className="w-4 h-4 me-1.5">{icon}</span>}
      {label}
    </button>
  );
};

const AdventuresScreen: React.FC<AdventuresScreenProps> = ({ 
  adventures, 
  stories, 
  currentUser, 
  onSelectAdventure, 
  onSendMessage, 
  onToggleInterest, 
  onSelectStories,
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
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const filteredAdventures = useMemo(() => {
    let adventuresToFilter = adventures;

    // Time filter
    const now = new Date();
    if (timeFilter === 'upcoming') {
      adventuresToFilter = adventuresToFilter.filter(adv => new Date(adv.startDate) >= now);
    } else if (timeFilter === 'past') {
      adventuresToFilter = adventuresToFilter.filter(adv => {
        const effectiveDateString = adv.endDate || adv.startDate;
        const endDateTime = new Date(effectiveDateString);
        
        const wasTimeSpecified = endDateTime.getHours() !== 0 || endDateTime.getMinutes() !== 0 || endDateTime.getSeconds() !== 0 || endDateTime.getMilliseconds() !== 0;

        if (wasTimeSpecified) {
            return now > endDateTime;
        } else {
            const tempDate = new Date(endDateTime);
            tempDate.setHours(23, 59, 59, 999);
            return now > tempDate;
        }
      });
    }

    // Type filter
    if (selectedAdventureType === 'all') {
      return adventuresToFilter;
    }
    return adventuresToFilter.filter(adventure => adventure.type === selectedAdventureType);
  }, [adventures, selectedAdventureType, timeFilter]);

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
      <div className="space-y-3 pt-3">
        <div className="px-4 pt-1">
          <div className="flex justify-center space-x-1 bg-slate-100 dark:bg-dark-bg-secondary p-1 rounded-full">
            <TimeFilterButton
              label={t('upcoming')}
              icon={<CalendarIcon className="w-4 h-4" />}
              isActive={timeFilter === 'upcoming'}
              onClick={() => setTimeFilter('upcoming')}
            />
            <TimeFilterButton
              label={t('all')}
              isActive={timeFilter === 'all'}
              onClick={() => setTimeFilter('all')}
            />
            <TimeFilterButton
              label={t('past')}
              icon={<CheckCircleIcon className="w-4 h-4" />}
              isActive={timeFilter === 'past'}
              onClick={() => setTimeFilter('past')}
            />
          </div>
        </div>

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

export default AdventuresScreen;