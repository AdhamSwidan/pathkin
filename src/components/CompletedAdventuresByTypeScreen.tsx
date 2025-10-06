
import React, { useMemo } from 'react';
import { User, HydratedAdventure, AdventureType, ActivityStatus } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import { useTranslation } from '../contexts/LanguageContext';

interface CompletedAdventuresByTypeScreenProps {
  onBack: () => void;
  user: User;
  type: AdventureType;
  allAdventures: HydratedAdventure[];
  currentUser: User;
  isGuest: boolean;
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
  onJoinGroupChat: (adventure: HydratedAdventure) => void;
}

const CompletedAdventuresByTypeScreen: React.FC<CompletedAdventuresByTypeScreenProps> = ({
  onBack,
  user,
  type,
  allAdventures,
  currentUser,
  isGuest,
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

  const completedAdventuresOfType = useMemo(() => {
    const confirmedAdventureIds = new Set(
      (user.activityLog || [])
        .filter(entry => entry.status === ActivityStatus.Confirmed)
        .map(entry => entry.adventureId)
    );

    return allAdventures.filter(
      adv => adv.type === type && confirmedAdventureIds.has(adv.id)
    );
  }, [user, type, allAdventures]);

  const screenTitle = t('completedAdventuresTitle', { type: t(`AdventureType_${type}`) });

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={screenTitle} onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-2">
        {completedAdventuresOfType.length > 0 ? (
          completedAdventuresOfType.map(adventure => (
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
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            {t('noAdventuresInSection')}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletedAdventuresByTypeScreen;
