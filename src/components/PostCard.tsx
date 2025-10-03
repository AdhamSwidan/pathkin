import React from 'react';
import { PostType, User, HydratedPost, ActivityStatus } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import PlayIcon from './icons/PlayIcon';
import RepostIcon from './icons/RepostIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ShareIcon from './icons/ShareIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../contexts/LanguageContext';
import MessageIcon from './icons/MessageIcon';

interface PostCardProps {
  post: HydratedPost;
  currentUser: User | null;
  isGuest: boolean;
  onCommentClick: (post: HydratedPost) => void;
  onMessageClick: (user: User) => void;
  onInterestToggle: (postId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onSharePost: (post: HydratedPost) => void;
  onToggleCompleted: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUser, 
  isGuest,
  onCommentClick, 
  onMessageClick,
  onInterestToggle, 
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onSharePost,
  onToggleCompleted,
}) => {
  const { t, language } = useTranslation();
  
  const isInterested = currentUser ? post.interestedUsers.includes(currentUser.id) : false;
  const isReposted = currentUser ? currentUser.reposts.includes(post.id) : false;
  const isSaved = currentUser ? currentUser.savedPosts.includes(post.id) : false;
  const isAuthor = currentUser?.id === post.author.id;
  
  const activityLogEntry = currentUser ? currentUser.activityLog.find(a => a.postId === post.id) : undefined;
  const activityStatus = activityLogEntry?.status;

  // التحقق من التاريخ لتحديد إذا ممكن يكبس Done
  const canMarkAsDone = () => {
    const now = new Date();
    const startDate = new Date(post.startDate);
    const endDate = post.endDate ? new Date(post.endDate) : null;
    
    // إذا في تاريخ نهاية، لازم يكون بعد تاريخ النهاية
    if (endDate) {
      return now >= endDate;
    }
    // إذا ما في تاريخ نهاية، لازم يكون بعد تاريخ البداية
    else {
      return now >= startDate;
    }
  };

  const getTimeStatus = () => {
    const now = new Date();
    const startDate = new Date(post.startDate);
    const endDate = post.endDate ? new Date(post.endDate) : null;
    
    if (endDate && now < endDate) {
      return 'event_not_ended';
    } else if (!endDate && now < startDate) {
      return 'event_not_started';
    } else {
      return 'can_mark_done';
    }
  };

  const timeStatus = getTimeStatus();

  const getTagStyle = (type: PostType) => {
    switch (type) {
      case PostType.Travel:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
      case PostType.Housing:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      case PostType.Event:
        return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300';
      case PostType.Hiking:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      case PostType.Camping:
        return 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300';
      case PostType.Volunteering:
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300';
      case PostType.Cycling:
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
    if (activityStatus === ActivityStatus.Pending) return 'text-yellow-500';
    return '';
  };

  const getDoneButtonText = () => {
    if (activityStatus === ActivityStatus.Confirmed) return '✓ Done';
    if (activityStatus === ActivityStatus.Pending) return '⏳ Pending';
    
    if (timeStatus === 'event_not_ended') return 'Event not ended';
    if (timeStatus === 'event_not_started') return 'Event not started';
    
    return 'Mark Done';
  };

  const isDoneButtonDisabled = isGuest || !currentUser || !canMarkAsDone();
  
  const actionButtonClasses = "flex items-center space-x-1 transition-colors";
  const disabledClasses = "cursor-not-allowed text-gray-400 dark:text-gray-600";

  const handleDoneClick = () => {
    if (!canMarkAsDone()) {
      alert(t(timeStatus === 'event_not_ended' ? 'eventNotEnded' : 'eventNotStarted'));
      return;
    }
    onToggleCompleted(post.id);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm mb-4">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
            <button onClick={() => onViewProfile(post.author)} className="flex items-center text-left hover:bg-neutral-800/50 rounded-md p-1 -m-1 flex-grow min-w-0">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full me-3 flex-shrink-0" />
                <div className="min-w-0">
                <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{post.author.name}</p>
                    {post.author.averageRating && (
                    <div className="flex items-center space-x-0.5 text-xs text-amber-500 flex-shrink-0">
                        <StarIcon className="w-3 h-3 fill-current" />
                        <span>{post.author.averageRating.toFixed(1)}</span>
                    </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString(language)}</p>
                </div>
            </button>
            {!isGuest && !isAuthor && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMessageClick(post.author);
                    }}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 flex-shrink-0 ms-2"
                    aria-label={`Message ${post.author.name}`}
                >
                    <MessageIcon />
                </button>
            )}
        </div>

        {/* Post Content */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{post.description}</p>
      </div>
      
      {/* Media Content */}
      {post.media && post.media.length > 0 && (
        <div className="bg-gray-100 dark:bg-black">
          {post.media[0].type === 'image' ? (
            <img src={post.media[0].url} alt="Post media" className="w-full max-h-96 object-cover" />
          ) : (
            <div className="relative flex justify-center items-center bg-black">
              <video src={post.media[0].url} className="w-full max-h-96" playsInline muted loop />
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
        {/* Post Details */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span className={`px-2 py-1 rounded-full font-medium ${getTagStyle(post.type)}`}>{t(`PostType_${post.type}`)}</span>
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">📍 {post.location}</span>
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">
            🗓️ {formatDate(post.startDate)} {post.endDate && `- ${formatDate(post.endDate)}`}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">💰 ~${post.budget}</span>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="border-t border-gray-200 dark:border-neutral-800 px-4 py-2 flex justify-around items-center text-gray-500 dark:text-gray-400">
        <button
          onClick={() => onInterestToggle(post.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-rose-500 ${isInterested ? 'text-rose-500' : ''}`}`}
        >
          <HeartIcon className={isInterested ? 'fill-current' : ''} />
          <span>{post.interestedUsers.length}</span>
        </button>
        <button 
          onClick={() => onCommentClick(post)} 
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : 'hover:text-sky-500'}`}
        >
          <CommentIcon />
          <span>{post.commentCount || 0}</span>
        </button>
        <button
          onClick={handleDoneClick}
          disabled={isDoneButtonDisabled}
          className={`${actionButtonClasses} ${isDoneButtonDisabled ? disabledClasses : `hover:text-green-500 ${checkmarkColor()}`}`}
          aria-label="Mark as done"
        >
          <CheckCircleIcon className={activityStatus ? 'fill-current' : ''} />
          <span className="text-xs whitespace-nowrap">
            {getDoneButtonText()}
          </span>
        </button>
        <button 
          onClick={() => onSharePost(post)}
          className={`${actionButtonClasses} hover:text-blue-500`}
        >
          <ShareIcon />
        </button>
        <button 
          onClick={() => onRepostToggle(post.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-emerald-500 ${isReposted ? 'text-emerald-500' : ''}`}`}
        >
          <RepostIcon />
        </button>
        <button 
          onClick={() => onSaveToggle(post.id)}
          disabled={isGuest}
          className={`${actionButtonClasses} ${isGuest ? disabledClasses : `hover:text-amber-500 ${isSaved ? 'text-amber-500' : ''}`}`}
        >
          <BookmarkIcon className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
