import React, { useState } from 'react';
import { AdventureType, User, ActivityStatus, HydratedAdventure } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import PlayIcon from './icons/PlayIcon';
import RepostIcon from './icons/RepostIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ShareIcon from './icons/ShareIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../contexts/LanguageContext';
import MoreIcon from './icons/MoreIcon';
import AdventureOptionsMenu from './AdventureOptionsMenu';

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
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
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
}) => {
  const { t, language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fix: Added fallbacks for potentially undefined array properties to prevent crashes.
  const isInterested = currentUser ? (adventure.interestedUsers || []).includes(currentUser.id) : false;
  const isReposted = currentUser ? (currentUser.repostedAdventures || []).includes(adventure.id) : false;
  const isSaved = currentUser ? (currentUser.savedAdventures || []).includes(adventure.id) : false;
  const isAuthor = currentUser?.id === adventure.author.id;
  
  const activityLogEntry = currentUser ? (currentUser.activityLog || []).find(a => a.adventureId === adventure.id) : undefined;
  const activityStatus = activityLogEntry?.status;


  const getTagStyle = (type: AdventureType) => {
    switch (type) {
      case AdventureType.Travel:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
      case AdventureType.Housing:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
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
        return 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const checkmarkColor = () => {
    if (activityStatus === ActivityStatus.Confirmed) return 'text-green-500';
    if (activityStatus === ActivityStatus.Pending) return 'text-amber-500';
    return '';
  };
  
  const actionButtonClasses = "flex items-center space-x-1 transition-colors";
  const disabledClasses = "cursor-not-allowed text-gray-400 dark:text-gray-600";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm mb-4">
      <div className="p-4">
        {/* Adventure Header */}
        <div className="flex items-start justify-between mb-3">
            <button onClick={() => onViewProfile(adventure.author)} className="flex items-center text-left hover:bg-neutral-800/50 rounded-md p-1 -m-1 flex-grow min-w-0">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(adventure.createdAt).toLocaleString(language)}</p>
                </div>
            </button>
            <div className="relative flex-shrink-0 ms-2">
                {isAuthor && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(prev => !prev);
                        }}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
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
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{adventure.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{adventure.description}</p>
      </div>
      
      {/* Media Content */}
      {adventure.media && adventure.media.length > 0 && (
        <div className="bg-gray-100 dark:bg-black">
          {adventure.media[0].type === 'image' ? (
            <img src={adventure.media[0].url} alt="Adventure media" className="w-full max-h-96 object-cover" />
          ) : (
            <div className="relative flex justify-center items-center bg-black">
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

      <div className="p-4">
        {/* Adventure Details */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span className={`px-2 py-1 rounded-full font-medium ${getTagStyle(adventure.type)}`}>{t(`AdventureType_${adventure.type}`)}</span>
          <button 
             onClick={() => onViewLocationOnMap(adventure)}
             disabled={!adventure.coordinates}
             className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-neutral-700"
          >
            📍 {adventure.location}
          </button>
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">
            🗓️ {formatDate(adventure.startDate)} {adventure.endDate && `- ${formatDate(adventure.endDate)}`}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">💰 ~${adventure.budget}</span>
        </div>
      </div>
      
      {/* Adventure Actions */}
      <div className="border-t border-gray-200 dark:border-neutral-800 px-4 py-2 flex justify-around items-center text-gray-500 dark:text-gray-400">
        <button
          onClick={() => onInterestToggle(adventure.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-rose-500 ${isInterested ? 'text-rose-500' : ''}`}`}
        >
          <HeartIcon className={isInterested ? 'fill-current' : ''} />
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
          <BookmarkIcon className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
};

export default AdventureCard;