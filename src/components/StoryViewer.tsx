
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HydratedStory, User, AdventurePrivacy } from '../types';
import MoreIcon from './icons/MoreIcon';
import { useTranslation } from '../contexts/LanguageContext';
import GlobeIcon from './icons/GlobeIcon';
import UsersIcon from './icons/UsersIcon';
import CakeIcon from './icons/CakeIcon';

interface StoryViewerProps {
  stories: HydratedStory[];
  onClose: () => void;
  currentUser: User | null;
  onDeleteStory: (story: HydratedStory) => void;
  onUpdateStoryPrivacy: (storyId: string, privacy: AdventurePrivacy) => void;
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

const PrivacyEditor: React.FC<{
    currentPrivacy: AdventurePrivacy;
    onSave: (newPrivacy: AdventurePrivacy) => void;
    onClose: () => void;
}> = ({ currentPrivacy, onSave, onClose }) => {
    const { t } = useTranslation();
    const [selectedPrivacy, setSelectedPrivacy] = useState(currentPrivacy);

    const privacyOptions = [
        { value: AdventurePrivacy.Public, icon: <GlobeIcon className="w-5 h-5 mr-3"/>, label: t('AdventurePrivacy_Public') },
        { value: AdventurePrivacy.Followers, icon: <UsersIcon className="w-5 h-5 mr-3"/>, label: t('AdventurePrivacy_Followers') },
        { value: AdventurePrivacy.Twins, icon: <CakeIcon className="w-5 h-5 mr-3"/>, label: t('AdventurePrivacy_Twins') },
    ];

    return (
        <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-neutral-800 rounded-lg p-4 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-bold text-lg mb-4">{t('editPrivacy')}</h3>
                <div className="space-y-2">
                    {privacyOptions.map(opt => (
                        <label key={opt.value} className={`flex items-center p-3 rounded-md cursor-pointer ${selectedPrivacy === opt.value ? 'bg-orange-500/20' : 'hover:bg-neutral-700'}`}>
                            <input
                                type="radio"
                                name="privacy"
                                value={opt.value}
                                checked={selectedPrivacy === opt.value}
                                onChange={() => setSelectedPrivacy(opt.value)}
                                className="hidden"
                            />
                            {opt.icon}
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-white font-semibold">{t('cancel')}</button>
                    <button onClick={() => onSave(selectedPrivacy)} className="px-4 py-2 bg-orange-600 text-white rounded-md font-semibold">{t('saveChanges')}</button>
                </div>
            </div>
        </div>
    );
};

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose, currentUser, onDeleteStory, onUpdateStoryPrivacy }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);
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
  
  const handleSavePrivacy = (newPrivacy: AdventurePrivacy) => {
    onUpdateStoryPrivacy(currentStory.id, newPrivacy);
    setIsEditingPrivacy(false);
    setIsMenuOpen(false);
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
                        <div ref={menuRef} className="absolute top-full right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg z-20 text-white divide-y divide-neutral-700">
                           <button onClick={() => { setIsEditingPrivacy(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700">
                                {t('editPrivacy')}
                            </button>
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 text-red-500">
                                {t('deleteStory')}
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
      
      {isAuthor && isEditingPrivacy && (
         <PrivacyEditor
            currentPrivacy={currentStory.privacy || AdventurePrivacy.Public}
            onSave={handleSavePrivacy}
            onClose={() => setIsEditingPrivacy(false)}
         />
      )}
    </div>
  );
};

export default StoryViewer;
