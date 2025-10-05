import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HydratedStory, User } from '../types';
import MoreIcon from './icons/MoreIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface StoryViewerProps {
  stories: HydratedStory[];
  onClose: () => void;
  currentUser: User | null;
  onDeleteStory: (story: HydratedStory) => void;
}

// Progress Bar component
const ProgressBar: React.FC<{ active: boolean; progress: number }> = ({ active, progress }) => (
  <div className="flex-1 h-1 bg-white/30 rounded-full mx-0.5">
    <div
      className={`h-full rounded-full ${active ? 'bg-white' : ''}`}
      style={{ width: `${active ? progress : 0}%`, transition: active ? 'width 0.1s linear' : 'none' }}
    />
  </div>
);

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose, currentUser, onDeleteStory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsMenuOpen(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goToPrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
    setIsMenuOpen(false);
  };

  useEffect(() => {
    setProgress(0); // Reset progress on story change
    
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    if (currentStory.media.type === 'image') {
      const timer = setTimeout(goToNext, 5000); // 5 seconds for images
      
      const interval = setInterval(() => {
        setProgress(p => p + (100 / (5000 / 100)));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [currentIndex, stories, goToNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= stories.length && stories.length > 0) {
        setCurrentIndex(stories.length - 1);
    } else if (stories.length === 0) {
        onClose();
    }
  }, [stories, currentIndex, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!stories || stories.length === 0 || !stories[currentIndex]) {
    return null;
  }

  const currentStory = stories[currentIndex];
  const isAuthor = currentUser?.id === currentStory.authorId;

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleDelete = () => {
    if(window.confirm(t('confirmDelete'))) {
        onDeleteStory(currentStory);
        setIsMenuOpen(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col p-2 animate-fade-in select-none">
      {/* Progress Bars */}
      <div className="absolute top-4 left-2 right-2 z-20 flex">
        {stories.map((_, index) => (
          <ProgressBar
            key={index}
            active={index === currentIndex}
            progress={index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={currentStory.author.avatarUrl} alt={currentStory.author.name} className="w-8 h-8 rounded-full" />
            <span className="text-white font-semibold text-sm">{currentStory.author.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthor && (
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-white p-1">
                        <MoreIcon />
                    </button>
                    {isMenuOpen && (
                        <div ref={menuRef} className="absolute top-full right-0 mt-2 w-36 bg-neutral-800 rounded-md shadow-lg z-20 text-white">
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 text-red-500">
                                {t('deleteAdventure')}
                            </button>
                        </div>
                    )}
                </div>
            )}
            <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {currentStory.media.type === 'image' ? (
          <img src={currentStory.media.url} alt="Story content" className="max-w-full max-h-full rounded-lg" />
        ) : (
          <video
            key={currentStory.id} // Re-mount video element on story change
            src={currentStory.media.url}
            className="max-w-full max-h-full rounded-lg"
            autoPlay
            onEnded={goToNext}
            onTimeUpdate={handleVideoProgress}
            playsInline
          />
        )}
         {/* Navigation zones */}
        <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onMouseDown={goToPrev}></div>
            <div className="w-2/3 h-full" onMouseDown={goToNext}></div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;