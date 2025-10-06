


import React, { useState } from 'react';
import { AdventureType, User, ActivityStatus, HydratedAdventure, AdventurePrivacy } from '../types';
import InterestIcon from './icons/InterestIcon';
import CommentIcon from './icons/CommentIcon';
import PlayIcon from './icons/PlayIcon';
import RepostIcon from './icons/RepostIcon';
import SaveIcon from './icons/SaveIcon';
import ShareIcon from './icons/ShareIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../contexts/LanguageContext';
import MoreIcon from './icons/MoreIcon';
import AdventureOptionsMenu from './AdventureOptionsMenu';
import GlobeIcon from './icons/GlobeIcon';
import UsersIcon from './icons/UsersIcon';
import CakeIcon from './icons/CakeIcon';
import MessageIcon from './icons/MessageIcon';

interface AdventureCardProps {
  adventure: HydratedAdventure;
  currentUser: User | null; // Can be null for guests
  isGuest: boolean;
  onCommentClick: (adventure: HydratedAdventure) => void;
  onMessageClick: (user: User) => void;
  onInterestToggle: (adventureId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  onViewLocationOnMap: (adventure: HydratedAdventure | null) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
  onJoinGroupChat: (adventure: HydratedAdventure) => void;
}

const AdventureCard: React.FC<AdventureCardProps> = ({ 
  adventure, 
  currentUser, 
  isGuest,
  onCommentClick, 
  onMessageClick,
  onInterestToggle, 
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareAdventure,
  onToggleCompleted,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
  onJoinGroupChat
}) => {
  const { t, language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isInterested = currentUser ? (adventure.interestedUsers || []).includes(currentUser.id) : false;
  const isReposted = currentUser ? (currentUser.repostedAdventures || []).includes(adventure.id) : false;
  const isSaved = currentUser ? (currentUser.savedAdventures || []).includes(adventure.id) : false;
  const isAuthor = currentUser?.id === adventure.author.id;
  
  const activityLogEntry = currentUser ? (currentUser.activityLog || []).find(a => a.adventureId === adventure.id) : undefined;
  const activityStatus = activityLogEntry?.status;

  const adventureEndDate = new Date(adventure.endDate || adventure.startDate);
  adventureEndDate.setHours(23, 59, 59, 999); // Consider the adventure past after its end day is fully over.
  const isPast = new Date() > adventureEndDate;

  const handleLocationClick = () => {
    if (isPast) {
      onViewLocationOnMap(null);
    } else {
      onViewLocationOnMap(adventure);
    }
  };


  const getTagStyle = (type: AdventureType) => {
    switch (type) {
      case AdventureType.Travel:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
      case AdventureType.Event:
        return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300';
      case AdventureType.Hiking:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      case AdventureType.Camping:
        return 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300';
      case AdventureType.Volunteering:
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300';
      case AdventureType.Cycling:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-200';
    }
  };

  const getPrivacyInfo = (privacy: AdventurePrivacy, subPrivacy?: AdventurePrivacy.Public | AdventurePrivacy.Followers) => {
    switch (privacy) {
        case AdventurePrivacy.Public:
            return { icon: <GlobeIcon className="w-3 h-3" />, text: t('AdventurePrivacy_Public') };
        case AdventurePrivacy.Followers:
            return { icon: <UsersIcon className="w-3 h-3" />, text: t('AdventurePrivacy_Followers') };
        case AdventurePrivacy.Twins:
            let text = t('AdventurePrivacy_Twins');
            if (subPrivacy === AdventurePrivacy.Public) {
                text += ` + ${t('AdventurePrivacy_Public')}`;
            } else if (subPrivacy === AdventurePrivacy.Followers) {
                text += ` + ${t('AdventurePrivacy_Followers')}`;
            }
            return { icon: <CakeIcon className="w-3 h-3" />, text: text };
        default:
            return { icon: <GlobeIcon className="w-3 h-3" />, text: t('AdventurePrivacy_Public') };
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatBudget = () => {
    const label = t('budget');
    return `${label.replace(' ($)','')} ~$${adventure.budget}`;
  };
  
  const formatDates = () => {
    let dateText = `${formatDate(adventure.startDate)}`;
    if (adventure.endDate) {
        dateText += ` - ${formatDate(adventure.endDate)}`;
    }
    return dateText;
  };
  
  const getLocationText = () => {
    switch (adventure.type) {
        case AdventureType.Travel:
            return `${t('from')}: ${adventure.location}`;
        case AdventureType.Hiking:
        case AdventureType.Cycling:
            return `${t('startPoint')}: ${adventure.location}`;
        default:
            return adventure.location;
    }
  };


  const checkmarkColor = () => {
    if (activityStatus === ActivityStatus.Confirmed) return 'text-green-500';
    if (activityStatus === ActivityStatus.Pending) return 'text-amber-500';
    return '';
  };
  
  const actionButtonClasses = "flex items-center space-x-1 transition-colors";
  const disabledClasses = "cursor-not-allowed text-gray-400 dark:text-gray-600";

  return (
    <div className="bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-black/[.02] dark:shadow-black/[.05] mb-4">
      <div className="p-4">
        {/* Adventure Header */}
        <div className="flex items-start justify-between mb-3">
            <button onClick={() => onViewProfile(adventure.author)} className="flex items-center text-left hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-md p-1 -m-1 flex-grow min-w-0">
                <img src={adventure.author.avatarUrl} alt={adventure.author.name} className="w-10 h-10 rounded-full me-3 flex-shrink-0" />
                <div className="min-w-0">
                <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{adventure.author.name}</p>
                    {adventure.author.averageRating && (
                    <div className="flex items-center space-x-0.5 text-xs text-amber-500 flex-shrink-0">
                        <StarIcon className="w-3 h-3 fill-current" />
                        <span>{adventure.author.averageRating.toFixed(1)}</span>
                    </div>
                    )}
                </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(adventure.createdAt).toLocaleString(language)}
                    {' · '}
                    <span className="inline-flex items-center space-x-1">
                        {getPrivacyInfo(adventure.privacy, adventure.subPrivacy).icon}
                        <span>{getPrivacyInfo(adventure.privacy, adventure.subPrivacy).text}</span>
                    </span>
                </p>
                </div>
            </button>
            <div className="relative flex-shrink-0 ms-2">
                {isAuthor && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(prev => !prev);
                        }}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <MoreIcon />
                    </button>
                )}
                {isMenuOpen && (
                    <AdventureOptionsMenu 
                        adventure={adventure}
                        onClose={() => setIsMenuOpen(false)}
                        onDelete={() => { onDeleteAdventure(adventure.id); setIsMenuOpen(false); }}
                        onEdit={() => { onEditAdventure(adventure); setIsMenuOpen(false); }}
                    />
                )}
            </div>
        </div>

        {/* Adventure Content */}
        <div className="px-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{adventure.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{adventure.description}</p>
        </div>
      </div>
      
      {/* Media Content */}
      {adventure.media && adventure.media.length > 0 && (
        <div className="px-4 pb-4">
          {adventure.media[0].type === 'image' ? (
            <img src={adventure.media[0].url} alt="Adventure media" className="w-full max-h-96 object-cover rounded-2xl" />
          ) : (
            <div className="relative flex justify-center items-center bg-black rounded-2xl overflow-hidden">
              <video src={adventure.media[0].url} className="w-full max-h-96" playsInline muted loop />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center pointer-events-none">
                 <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <PlayIcon className="w-8 h-8 text-white" />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-5 pb-4">
        {/* Adventure Details */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span className={`px-2 py-1 rounded-full font-medium ${getTagStyle(adventure.type)}`}>{t(`AdventureType_${adventure.type}`)}</span>
          <button 
             onClick={handleLocationClick}
             disabled={!isPast && !adventure.coordinates}
             className="px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            📍 {getLocationText()}
          </button>
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800">
            🗓️ {formatDates()}
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800">💰 {formatBudget()}</span>
        </div>
      </div>
      
      {/* Adventure Actions */}
      <div className="px-4 pb-3 pt-1 flex justify-around items-center text-gray-500 dark:text-gray-400">
        <button
          onClick={() => onInterestToggle(adventure.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-rose-500 ${isInterested ? 'text-rose-500' : ''}`}`}
        >
          <InterestIcon className={isInterested ? 'fill-current' : ''} />
          <span>{(adventure.interestedUsers || []).length}</span>
        </button>
        <button 
          onClick={() => onCommentClick(adventure)} 
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : 'hover:text-sky-500'}`}
        >
          <CommentIcon />
          <span>{adventure.commentCount || 0}</span>
        </button>
        <button
          onClick={() => onJoinGroupChat(adventure)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : 'hover:text-indigo-500'}`}
          title={t('groupChat')}
        >
            <MessageIcon />
        </button>
        <button
          onClick={() => onToggleCompleted(adventure.id)}
          disabled={isGuest || isAuthor}
          className={`${actionButtonClasses} ${isGuest || isAuthor ? disabledClasses : `hover:text-green-500 ${checkmarkColor()}`}`}
          aria-label="Mark as done"
        >
          <CheckCircleIcon className={activityStatus ? 'fill-current' : ''} />
        </button>
        <button 
          onClick={() => onShareAdventure(adventure)}
          className={`${actionButtonClasses} hover:text-blue-500`}
        >
          <ShareIcon />
        </button>
        <button 
          onClick={() => onRepostToggle(adventure.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-emerald-500 ${isReposted ? 'text-emerald-500' : ''}`}`}
        >
          <RepostIcon />
        </button>
        <button 
          onClick={() => onSaveToggle(adventure.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-amber-500 ${isSaved ? 'text-amber-500' : ''}`}`}
        >
          <SaveIcon className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
};

export default AdventureCard;