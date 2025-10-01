import React, { useState, useEffect, useCallback } from 'react';
import { HydratedStory } from '../types';

interface StoryViewerProps {
  stories: HydratedStory[];
  onClose: () => void;
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

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goToPrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    setProgress(0); // Reset progress on story change
    
    const currentStory = stories[currentIndex];
    if (currentStory.media.type === 'image') {
      const timer = setTimeout(goToNext, 5000); // 5 seconds for images
      
      // Animate progress bar for images
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
    // Hide scrollbar on body when viewer is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!stories || stories.length === 0) {
    onClose();
    return null;
  }

  const currentStory = stories[currentIndex];

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
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
          <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
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