import React from 'react';
import { User, HydratedAdventure } from '../../types';
import Header from '../Header';
import AdventureCard from '../AdventureCard';
import { useTranslation } from '../../contexts/LanguageContext';

interface SavedAdventuresScreenProps {
  onBack: () => void;
  adventures: HydratedAdventure[];
  currentUser: User;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
  // Fix: Add onJoinGroupChat to the props interface to resolve TypeScript error.
  onJoinGroupChat: (adventure: HydratedAdventure) => void;
}

const SavedAdventuresScreen: React.FC<SavedAdventuresScreenProps> = ({
  onBack,
  adventures,
  currentUser,
  onSelectAdventure,
  onSendMessage,
  onToggleInterest,
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareAdventure,
  onToggleCompleted,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
  onJoinGroupChat,
}) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={t('savedAdventures')} onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-2">
        {adventures.length > 0 ? (
          adventures.map(adventure => (
            <AdventureCard
              key={adventure.id}
              adventure={adventure}
              currentUser={currentUser}
              isGuest={false}
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
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">{t('noSavedAdventures')}</p>
        )}
      </div>
    </div>
  );
};

export default SavedAdventuresScreen;