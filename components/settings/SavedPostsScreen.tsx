
import React from 'react';
import Header from '../Header';
import { Post, User } from '../../types';
import PostCard from '../PostCard';

interface SavedPostsScreenProps {
  onBack: () => void;
  posts: Post[];
  currentUser: User;
  onCommentClick: (post: Post) => void;
  onInterestToggle: (postId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onToggleCompleted: (postId: string) => void;
}

const SavedPostsScreen: React.FC<SavedPostsScreenProps> = ({ 
    onBack, 
    posts, 
    currentUser, 
    onCommentClick, 
    onInterestToggle,
    onViewProfile,
    onRepostToggle,
    onSaveToggle,
    onSharePost,
    onToggleCompleted
}) => {
  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <Header title="Saved Posts" onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-2">
        {posts.length > 0 ? (
            posts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    isGuest={false}
                    onCommentClick={onCommentClick}
                    onInterestToggle={onInterestToggle}
                    onViewProfile={onViewProfile}
                    onRepostToggle={onRepostToggle}
                    onSaveToggle={onSaveToggle}
                    onSharePost={onSharePost}
                    onToggleCompleted={onToggleCompleted}
                />
            ))
        ) : (
            <div className="text-center py-20 px-4">
                <p className="text-gray-400 font-semibold text-lg">No Saved Posts</p>
                <p className="text-gray-500 text-sm mt-1">You haven't saved any posts yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsScreen;
