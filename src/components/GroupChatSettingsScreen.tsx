import React from 'react';
import { HydratedConversation, User } from '../types';
import Header from './Header';
import LeaveIcon from './icons/LeaveIcon';

interface GroupChatSettingsScreenProps {
  conversation: HydratedConversation;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onLeaveGroup: (conversation: HydratedConversation) => void;
  onViewProfile: (user: User) => void;
}

const GroupChatSettingsScreen: React.FC<GroupChatSettingsScreenProps> = ({ 
    conversation, currentUser, allUsers, onBack, onLeaveGroup, onViewProfile 
}) => {
  
  const participants = conversation.participants
    .map(pId => allUsers.find(u => u.id === pId))
    .filter((u): u is User => u !== undefined);
    
  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
        onLeaveGroup(conversation);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title="Group Info" onBack={onBack} />
      
      <div className="flex-grow overflow-y-auto p-4">
        {/* Group Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={conversation.imageUrl} alt={conversation.name} className="w-24 h-24 rounded-full object-cover mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{conversation.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{participants.length} members</p>
        </div>
        
        {/* Members List */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
            <h3 className="p-4 text-lg font-semibold border-b border-gray-200 dark:border-neutral-800">Members</h3>
            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                {participants.map(user => (
                    <button key={user.id} onClick={() => onViewProfile(user)} className="w-full text-left p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-semibold">{user.name}</span>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6">
            <button onClick={handleLeave} className="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/40">
                <LeaveIcon className="w-5 h-5 me-2" />
                <span>Leave Group</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default GroupChatSettingsScreen;