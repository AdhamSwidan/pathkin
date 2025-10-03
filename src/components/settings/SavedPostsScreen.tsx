import React from 'react';
import { User, HydratedPost } from '../../types';
import Header from '../Header';
import PostCard from '../PostCard';
import { useTranslation } from '../../contexts/LanguageContext';

interface SavedPostsScreenProps {
  onBack: () => void;
  posts: HydratedPost[];
  currentUser: User;
  onSelectPost: (post: HydratedPost) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (postId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onSharePost: (post: HydratedPost) => void;
  onToggleCompleted: (postId: string) => void;
  onViewLocationOnMap: (post: HydratedPost) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (post: HydratedPost) => void;
}

const SavedPostsScreen: React.FC<SavedPostsScreenProps> = ({
  onBack,
  posts,
  currentUser,
  onSelectPost,
  onSendMessage,
  onToggleInterest,
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onSharePost,
  onToggleCompleted,
  onViewLocationOnMap,
  onDeletePost,
  onEditPost,
}) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={t('savedPosts')} onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-2">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              isGuest={false}
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
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">{t('noSavedPosts')}</p>
        )}
      </div>
    </div>
  );
};

export default SavedPostsScreen;