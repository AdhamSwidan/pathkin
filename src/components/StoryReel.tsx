import React, { useMemo } from 'react';
import { User, HydratedStory } from '../types';
import PlusIcon from './icons/PlusIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface StoryReelProps {
  stories: HydratedStory[];
  currentUser: User;
  onSelectStories: (stories: HydratedStory[]) => void;
  onAddStory: () => void;
  viewedStoryTimestamps: Record<string, string>;
}

// Single item for a user's story reel
const StoryReelItem: React.FC<{ author: User; hasUnviewed: boolean; onClick: () => void }> = ({ author, hasUnviewed, onClick }) => (
  <button onClick={onClick} className="flex-shrink-0 flex flex-col items-center space-y-1 w-20 text-center">
    <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnviewed ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600' : 'bg-gray-300 dark:bg-neutral-700'}`}>
      <img
        src={author.avatarUrl}
        alt={author.name}
        className="w-full h-full rounded-full border-2 border-light-bg dark:border-dark-bg-secondary object-cover"
      />
    </div>
    <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full">{author.name}</span>
  </button>
);

// Special item for the current user to add/view their own story
const MyStoryReelItem: React.FC<{
  myStories: HydratedStory[];
  currentUser: User;
  hasUnviewed: boolean;
  onAddStory: () => void;
  onViewMyStories: () => void;
}> = ({ myStories, currentUser, hasUnviewed, onAddStory, onViewMyStories }) => {
  const { t } = useTranslation();
  const hasStory = myStories.length > 0;

  if (hasStory) {
     return (
        <button onClick={onViewMyStories} className="flex-shrink-0 flex flex-col items-center space-y-1 w-20 text-center">
            <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnviewed ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600' : 'bg-gray-300 dark:bg-neutral-700'}`}>
                <img
                    src={currentUser.avatarUrl}
                    alt={t('myStory')}
                    className="w-full h-full rounded-full border-2 border-light-bg dark:border-dark-bg-secondary object-cover"
                />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('myStory')}</span>
        </button>
     )
  }

  return (
    <button onClick={onAddStory} className="flex-shrink-0 flex flex-col items-center space-y-1 w-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-bg-secondary flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white">
                <PlusIcon strokeWidth="2.5" />
             </div>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{t('addStory')}</span>
    </button>
  );
};


const StoryReel: React.FC<StoryReelProps> = ({ stories, currentUser, onSelectStories, onAddStory, viewedStoryTimestamps }) => {
  const { myStories, otherUserStoriesGrouped, myStoriesHaveUnviewed } = useMemo(() => {
    const myStories = stories.filter(s => s.author.id === currentUser.id);
    
    const others = stories.filter(s => s.author.id !== currentUser.id);
    const grouped = others.reduce((acc, story) => {
      if (!acc[story.author.id]) {
        acc[story.author.id] = [];
      }
      acc[story.author.id].push(story);
      return acc;
    }, {} as Record<string, HydratedStory[]>);

    const lastViewedForMe = viewedStoryTimestamps[currentUser.id];
    const myLatestStory = myStories.length > 0 ? myStories.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b) : null;
    const myStoriesHaveUnviewed = myLatestStory ? !lastViewedForMe || new Date(myLatestStory.createdAt) > new Date(lastViewedForMe) : false;

    return { myStories, otherUserStoriesGrouped: Object.values(grouped), myStoriesHaveUnviewed };
  }, [stories, currentUser.id, viewedStoryTimestamps]);

  const sortStoriesChronologically = (storyGroup: HydratedStory[]) => {
    return storyGroup.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return (
    <div className="px-2 pt-3">
      <div className="flex space-x-3 overflow-x-auto pb-2 -mb-2">
        <MyStoryReelItem 
          myStories={myStories}
          currentUser={currentUser} 
          hasUnviewed={myStoriesHaveUnviewed}
          onAddStory={onAddStory} 
          onViewMyStories={() => onSelectStories(sortStoriesChronologically(myStories))} 
        />
        {otherUserStoriesGrouped.map(storyGroup => {
          const authorId = storyGroup[0].author.id;
          const lastViewed = viewedStoryTimestamps[authorId];
          const latestStory = storyGroup.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
          const hasUnviewed = !lastViewed || new Date(latestStory.createdAt) > new Date(lastViewed);

          return (
            <StoryReelItem 
              key={authorId} 
              author={storyGroup[0].author} 
              hasUnviewed={hasUnviewed}
              onClick={() => onSelectStories(sortStoriesChronologically(storyGroup))} 
            />
          );
        })}
      </div>
    </div>
  );
};

export default StoryReel;