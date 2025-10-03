import React, { useState } from 'react';
import { HydratedAdventure, HydratedComment, User } from '../types';
import SendIcon from './icons/SendIcon';

interface AdventureDetailModalProps {
  adventure: HydratedAdventure;
  comments: HydratedComment[];
  currentUser: User | null;
  onClose: () => void;
  onAddComment: (adventureId: string, text: string) => void;
}

const AdventureDetailModal: React.FC<AdventureDetailModalProps> = ({ adventure, comments, currentUser, onClose, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(adventure.id, newComment.trim());
      setNewComment('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">{adventure.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="flex items-center mb-4">
            <img src={adventure.author.avatarUrl} alt={adventure.author.name} className="w-10 h-10 rounded-full me-3" />
            <div>
              <p className="font-semibold dark:text-gray-100">{adventure.author.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{adventure.location}</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{adventure.description}</p>
          
          <h3 className="font-bold mb-2 dark:text-white">Comments ({comments.length})</h3>
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full mt-1" />
                <div className="bg-gray-100 dark:bg-neutral-800 p-2 rounded-lg flex-1">
                  <p className="font-semibold text-sm dark:text-gray-200">{comment.author.name}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-300">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>}
          </div>
        </div>

        {currentUser && (
          <div className="p-4 border-t dark:border-neutral-800 mt-auto bg-white dark:bg-neutral-900">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 p-2 border border-gray-300 rounded-full text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              />
              <button onClick={handleCommentSubmit} className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700">
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdventureDetailModal;
