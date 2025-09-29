
import React, { useState, useMemo } from 'react';
import { Post, User } from '../types';
import Header from './Header';
import PostCard from './PostCard';
import GridIcon from './icons/GridIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import RepostIcon from './icons/RepostIcon';
import ShareIcon from './icons/ShareIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import BarChartIcon from './icons/BarChartIcon';
import StatsScreen from './StatsScreen';
import StarIcon from './icons/StarIcon';
import SettingsIcon from './icons/SettingsIcon';
import { useTranslation } from '../contexts/LanguageContext';


interface ProfileScreenProps {
  user: User;
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (postId: string) => void;
  onViewProfile: (user: User) => void;
  onRepostToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onShareProfile: (user: User) => void;
  onSharePost: (postId: string) => void;
  onToggleCompleted: (postId: string) => void;
  onOpenFollowList: (user: User, listType: 'followers' | 'following') => void;
  onNavigateToSettings: () => void;
}

type ProfileTab = 'posts' | 'saved' | 'reposts' | 'completed' | 'stats';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  allPosts,
  onSelectPost, 
  onSendMessage, 
  onToggleInterest, 
  onViewProfile,
  onRepostToggle,
  onSaveToggle,
  onShareProfile,
  onSharePost,
  onToggleCompleted,
  onOpenFollowList,
  onNavigateToSettings,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const { t } = useTranslation();

  const headerActions = (
    <div className="flex items-center space-x-2">
      <button onClick={() => onShareProfile(user)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
        <ShareIcon />
      </button>
      <button onClick={onNavigateToSettings} className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
        <SettingsIcon />
      </button>
    </div>
  );
  
  const { userPosts, savedPosts, repostedPosts, completedPosts } = useMemo(() => {
    const userPosts = allPosts.filter(p => p.author.id === user.id);
    const savedPosts = allPosts.filter(p => user.savedPosts.includes(p.id));
    const repostedPosts = allPosts.filter(p => user.reposts.includes(p.id));
    const completedPosts = allPosts.filter(p => user.activityLog.some(a => a.postId === p.id));
    return { userPosts, savedPosts, repostedPosts, completedPosts };
  }, [allPosts, user]);
  
  const renderedPosts = useMemo(() => {
    if (activeTab === 'saved') return savedPosts;
    if (activeTab === 'reposts') return repostedPosts;
    if (activeTab === 'completed') return completedPosts;
    return userPosts;
  }, [activeTab, userPosts, savedPosts, repostedPosts, completedPosts]);

  const TabButton: React.FC<{ tab: ProfileTab; icon: React.ReactNode; }> = ({ tab, icon }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-3 flex justify-center items-center border-b-2 transition-colors duration-200 ${
          isActive ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-orange-500'
        }`}
      >
        {icon}
      </button>
    )
  };

  const renderContent = () => {
    if (activeTab === 'stats') {
      return <StatsScreen user={user} allPosts={allPosts} />;
    }

    return (
      <div className="mt-4 px-2">
        <div className="space-y-4">
           {renderedPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user}
                isGuest={false}
                onCommentClick={onSelectPost}
                onMessageClick={onSendMessage}
                onInterestToggle={onToggleInterest}
                onViewProfile={onViewProfile}
                onRepostToggle={onRepostToggle}
                onSaveToggle={onSaveToggle}
                onSharePost={onSharePost}
                onToggleCompleted={onToggleCompleted}
              />
            ))}
             {renderedPosts.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noPostsInSection')}</p>
             )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header title={user.name} rightAction={headerActions} />
      <div className="bg-white dark:bg-neutral-950 flex-grow">
        <img 
          src={user.coverUrl || `https://picsum.photos/seed/${user.id}-cover/800/200`} 
          alt="Cover" 
          className="w-full h-32 object-cover" 
        />
        
        <div className="px-4 relative">
          <div className="flex items-end">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-950 shadow-lg flex-shrink-0 -mt-12" 
            />
            <div className="flex-grow ms-4 flex items-center">
                <div className="flex justify-around w-full">
                    <div className="text-center">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{userPosts.length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('adventures')}</p>
                    </div>
                    <button className="text-center" onClick={() => onOpenFollowList(user, 'followers')}>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{user.followers.length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('followers')}</p>
                    </button>
                    <button className="text-center" onClick={() => onOpenFollowList(user, 'following')}>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{user.following.length}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500">{t('following')}</p>
                    </button>
                </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 px-4">
            <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
                {user.averageRating && (
                    <div className="flex items-center space-x-1 text-amber-500 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                        <StarIcon className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{user.averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.bio}</p>
        </div>
        
        <div className="mt-4 border-t border-b border-gray-200 dark:border-neutral-800 flex">
          <TabButton tab="posts" icon={<GridIcon />} />
          <TabButton tab="saved" icon={<BookmarkIcon />} />
          <TabButton tab="reposts" icon={<RepostIcon />} />
          <TabButton tab="completed" icon={<CheckCircleIcon />} />
          <TabButton tab="stats" icon={<BarChartIcon />} />
        </div>
        
        {renderContent()}
      </div>
    </>
  );
};

export default ProfileScreen;
