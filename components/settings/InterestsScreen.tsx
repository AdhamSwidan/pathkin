import React, { useState } from 'react';
import Header from '../Header';
import { User } from '../../types';

interface InterestsScreenProps {
  onBack: () => void;
  currentUser: User;
}

const allInterests = [
  'Hiking', 'Photography', 'Music', 'Tech', 'Art', 'Backpacking', 'Yoga', 'Foodie', 'Blogging', 'Culture', 'History', 'Museums', 'Architecture', 'Surfing', 'Skiing', 'Reading', 'Movies', 'Gaming'
];

const InterestsScreen: React.FC<InterestsScreenProps> = ({ onBack, currentUser }) => {
  const [selectedInterests, setSelectedInterests] = useState(new Set(currentUser.interests));

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <Header title="Your Interests" onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-4">
        <p className="text-center text-gray-400 mb-4">Select the topics that you're passionate about to get better recommendations.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {allInterests.map(interest => {
            const isSelected = selectedInterests.has(interest);
            return (
              <button 
                key={interest} 
                onClick={() => toggleInterest(interest)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:bg-neutral-700 hover:border-neutral-600'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>
       <div className="p-4 border-t border-neutral-800 bg-neutral-950">
        <button className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default InterestsScreen;