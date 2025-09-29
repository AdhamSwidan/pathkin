

import React, { useMemo } from 'react';
import { Story, User } from '../types';
import PlusIcon from './icons/PlusIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface StoryReelProps {
  stories: Story[];
  currentUser: User;
  onSelectStories: (stories: Story[]) => void;
  onAddStory: () => void;
}

// Single item for a user's story reel
const StoryReelItem: React.FC<{ author: User; hasBeenViewed?: boolean; onClick: () => void }> = ({ author, onClick }) => (
  <button onClick={onClick} className="flex-shrink-0 flex flex-col items-center space-y-1 w-20 text-center">
    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600">
      <img
        src={author.avatarUrl}
        alt={author.name}
        className="w-full h-full rounded-full border-2 border-white dark:border-neutral-900"
      />
    </div>
    <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full">{author.name}</span>
  </button>
);

// Special item for the current user to add/view their own story
const MyStoryReelItem: React.FC<{
  myStories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onViewMyStories: () => void;
}> = ({ myStories, currentUser, onAddStory, onViewMyStories }) => {
  const { t } = useTranslation();
  const hasStory = myStories.length > 0;

  return (
    <div className="flex-shrink-0 flex flex-col items-center space-y-1 w-20 text-center">
      <div className="w-16 h-16 rounded-full relative">
        <button
          onClick={hasStory ? onViewMyStories : onAddStory}
          className="w-full h-full rounded-full"
          aria-label={hasStory ? t('myStory') : t('addStory')}
        >
          {hasStory ? (
            <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600">
              <img
                src={currentUser.avatarUrl}
                alt={t('myStory')}
                className="w-full h-full rounded-full border-2 border-white dark:border-neutral-900"
              />
            </div>
          ) : (
            <img
              src={currentUser.avatarUrl}
              alt={t('addStory')}
              className="w-full h-full rounded-full"
            />
          )}
        </button>
        {/* Always show the add button */}
        <button
          onClick={onAddStory}
          className="absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center bottom-0 end-0 z-10 hover:bg-orange-600"
          aria-label={t('addStory')}
        >
          <PlusIcon className="w-4 h-4 text-white" strokeWidth="3" />
        </button>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{hasStory ? t('myStory') : t('addStory')}</span>
    </div>
  );
};


const StoryReel: React.FC<StoryReelProps> = ({ stories, currentUser, onSelectStories, onAddStory }) => {
  const { myStories, otherUserStoriesGrouped } = useMemo(() => {
    const myStories = stories.filter(s => s.author.id === currentUser.id);
    
    const others = stories.filter(s => s.author.id !== currentUser.id);
    const grouped = others.reduce((acc, story) => {
      if (!acc[story.author.id]) {
        acc[story.author.id] = [];
      }
      acc[story.author.id].push(story);
      return acc;
    }, {} as Record<string, Story[]>);

    return { myStories, otherUserStoriesGrouped: Object.values(grouped) };
  }, [stories, currentUser.id]);

  return (
    <div className="px-2 py-3 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex space-x-3 overflow-x-auto pb-2 -mb-2">
        <MyStoryReelItem 
          myStories={myStories}
          currentUser={currentUser} 
          onAddStory={onAddStory} 
          onViewMyStories={() => onSelectStories(myStories)} 
        />
        {otherUserStoriesGrouped.map(storyGroup => (
          <StoryReelItem 
            key={storyGroup[0].author.id} 
            author={storyGroup[0].author} 
            onClick={() => onSelectStories(storyGroup)} 
          />
        ))}
      </div>
    </div>
  );
};

export default StoryReel;