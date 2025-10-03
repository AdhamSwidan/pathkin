import React, { useState, useMemo } from 'react';
import { User, HydratedPost, HydratedStory, PostType } from '../types';
import Header from './Header';
import PostCard from './PostCard';
import StoryReel from './StoryReel';
import BellIcon from './icons/BellIcon';
import MessageIcon from './icons/MessageIcon';
import { useTranslation } from '../contexts/LanguageContext';
import PostTypeFilterBar from './PostTypeFilterBar';

interface FeedScreenProps {
  posts: HydratedPost[];
  stories: HydratedStory[];
  currentUser: User;
  onSelectPost: (post: HydratedPost) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (postId: string) => void;
  onSelectStories: (stories: HydratedStory[]) => void;
  onAddStory: () => void;
  onNotificationClick: () => void;
  hasUnreadNotifications: boolean;
  onNavigateToChat: () => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onSharePost: (post: HydratedPost) => void;
  onToggleCompleted: (postId: string) => void;
  isGuest: boolean;
  onViewLocationOnMap: (post: HydratedPost) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (post: HydratedPost) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ 
  posts, 
  stories, 
  currentUser, 
  onSelectPost, 
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
  onSharePost,
  onToggleCompleted,
  isGuest,
  onViewLocationOnMap,
  onDeletePost,
  onEditPost,
}) => {
  const { t } = useTranslation();
  const [selectedPostType, setSelectedPostType] = useState<PostType | 'all'>('all');

  const filteredPosts = useMemo(() => {
    if (selectedPostType === 'all') {
      return posts;
    }
    return posts.filter(post => post.type === selectedPostType);
  }, [posts, selectedPostType]);

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
      
      <PostTypeFilterBar 
        selectedType={selectedPostType} 
        onSelectType={setSelectedPostType} 
      />

      <div className="px-2 pt-2">
        {filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser}
            isGuest={isGuest}
            onCommentClick={onSelectPost}
            onMessageClick={onSendMessage}
            onInterestToggle={onToggleInterest}
            onViewProfile={onViewProfile}
            onRepostToggle={onRepostToggle}
            onSaveToggle={onSaveToggle}
            onSharePost={onSharePost}
            onToggleCompleted={onToggleCompleted}
            onViewLocationOnMap={onViewLocationOnMap}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost}
          />
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('noPostsToShow')}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{selectedPostType === 'all' ? t('checkPrivacySettings') : t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedScreen;