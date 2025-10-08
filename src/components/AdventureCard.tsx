

import React, { useState, useMemo } from 'react';
import { AdventureType, User, ActivityStatus, HydratedAdventure, AdventurePrivacy, HydratedStory } from '../types';
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
  // Fix: Add missing story-related props to resolve TypeScript errors.
  stories: HydratedStory[];
  viewedStoryTimestamps: Record<string, string>;
  onSelectStories: (stories: HydratedStory[]) => void;
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
  stories,
  viewedStoryTimestamps,
  onCommentClick, 
  onMessageClick,
  onInterestToggle, 
  onViewProfile,
  onSelectStories,
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
  
  const { authorStories, hasUnviewedStories } = useMemo(() => {
    const authorStories = stories.filter(s => s.authorId === adventure.author.id);
    if (authorStories.length === 0) {
        return { authorStories: [], hasUnviewedStories: false };
    }
    const lastViewed = viewedStoryTimestamps[adventure.author.id];
    const latestStory = authorStories.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    const hasUnviewed = !lastViewed || new Date(latestStory.createdAt) > new Date(lastViewed);
    
    const sortedStories = authorStories.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { authorStories: sortedStories, hasUnviewedStories: hasUnviewed };
  }, [stories, adventure.author.id, viewedStoryTimestamps]);

  const handleAvatarClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (authorStories.length > 0) {
          onSelectStories(authorStories);
      } else {
          onViewProfile(adventure.author);
      }
  };


  const isPast = useMemo(() => {
    const now = new Date();
    // Use endDate if available, otherwise startDate
    const effectiveDateString = adventure.endDate || adventure.startDate;
    
    // This will parse the ISO string into a Date object in the user's local timezone
    const endDateTime = new Date(effectiveDateString);

    // Check if the time part is exactly midnight (local time).
    // This is our heuristic for "no time was specified", consistent with formatDates logic.
    const wasTimeSpecified = endDateTime.getHours() !== 0 || endDateTime.getMinutes() !== 0 || endDateTime.getSeconds() !== 0 || endDateTime.getMilliseconds() !== 0;

    if (wasTimeSpecified) {
        // If time was specified, the adventure is past if we are after that exact time.
        return now > endDateTime;
    } else {
        // If no time was specified (i.e., it's midnight),
        // set the time to the very end of that day and then compare.
        endDateTime.setHours(23, 59, 59, 999);
        return now > endDateTime;
    }
  }, [adventure.startDate, adventure.endDate]);


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
  
  const formatBudget = () => {
    const label = t('budget');
    return `${label.replace(' ($)','')} ~$${adventure.budget}`;
  };
  
  const formatDates = () => {
    const start = new Date(adventure.startDate);
    const end = adventure.endDate ? new Date(adventure.endDate) : null;

    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    
    // Heuristic: Check if the time is exactly midnight in the user's local timezone.
    // If so, we can assume time was not explicitly set and only show the date.
    const startHasTime = start.getHours() !== 0 || start.getMinutes() !== 0;

    let dateText = start.toLocaleDateString(language, dateOptions);
    if (startHasTime) {
      dateText += `, ${start.toLocaleTimeString(language, timeOptions)}`;
    }

    if (end) {
      const endHasTime = end.getHours() !== 0 || end.getMinutes() !== 0;
      const sameDay = start.toDateString() === end.toDateString();

      if (sameDay) {
        // If times are set and on the same day, format as "Date, Time1 - Time2"
        if (startHasTime && endHasTime) {
          dateText = `${start.toLocaleDateString(language, dateOptions)}, ${start.toLocaleTimeString(language, timeOptions)} - ${end.toLocaleTimeString(language, timeOptions)}`;
        } // If only end time is different on same day, this is already handled by the `dateText` above.
      } else {
        // If different days, show full end date/time
        dateText += ` - ${end.toLocaleDateString(language, dateOptions)}`;
        if (endHasTime) {
          dateText += `, ${end.toLocaleTimeString(language, timeOptions)}`;
        }
      }
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
            <div className="flex items-center text-left flex-grow min-w-0">
                <button onClick={handleAvatarClick} className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full p-0.5 ${hasUnviewedStories ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600' : ''}`}>
                        <img src={adventure.author.avatarUrl} alt={adventure.author.name} className="w-full h-full rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary object-cover" />
                    </div>
                </button>
                <div className="min-w-0 ms-3">
                <button onClick={() => onViewProfile(adventure.author)} className="flex items-center space-x-2 text-left">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{adventure.author.name}</p>
                    {adventure.author.averageRating && (
                    <div className="flex items-center space-x-0.5 text-xs text-amber-500 flex-shrink-0">
                        <StarIcon className="w-3 h-3 fill-current" />
                        <span>{adventure.author.averageRating.toFixed(1)}</span>
                    </div>
                    )}
                </button>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(adventure.createdAt).toLocaleString(language)}
                    {' · '}
                    <span className="inline-flex items-center space-x-1">
                        {getPrivacyInfo(adventure.privacy, adventure.subPrivacy).icon}
                        <span>{getPrivacyInfo(adventure.privacy, adventure.subPrivacy).text}</span>
                    </span>
                </p>
                </div>
            </div>
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
             onClick={() => adventure.coordinates && onViewLocationOnMap(adventure)}
             disabled={isPast || !adventure.coordinates}
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