import React from 'react';
import { Conversation, User } from '../types';
import Header from './Header';

interface ChatScreenProps {
  conversations: Conversation[];
  onSelectConversation: (user: User) => void;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversations, onSelectConversation, onBack }) => {
  return (
    <>
      <Header title="Messages" onBack={onBack} />
      <div className="divide-y divide-gray-200 dark:divide-neutral-800">
        {conversations.map(convo => (
          <div key={convo.id} onClick={() => onSelectConversation(convo.participant)} className="p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer">
            <img src={convo.participant.avatarUrl} alt={convo.participant.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-100">{convo.participant.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage.text}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatScreen;