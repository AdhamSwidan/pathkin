
import React, { useState } from 'react';
import { Post } from '../types';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface RatingModalProps {
  post: Post;
  onClose: () => void;
  onSubmit: (postId: string, rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ post, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    onSubmit(post.id, rating);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[101] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm flex flex-col p-6 text-center">
        <h2 className="text-xl font-bold dark:text-white mb-2">{t('rateYourExperience')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('howWasExperience', { name: post.author.name, title: post.title })}
        </p>
        
        <div className="flex justify-center items-center space-x-2 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <StarIcon
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'text-amber-400 fill-current'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 font-semibold"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 font-semibold disabled:bg-orange-300"
            disabled={rating === 0}
          >
            {t('submitRating')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
