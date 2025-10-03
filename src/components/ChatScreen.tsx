import React from 'react';
import { HydratedConversation, User } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatScreenProps {
  conversations: HydratedConversation[];
  onSelectConversation: (user: User) => void;
  onBack: () => void;
  currentUser: User;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversations, onSelectConversation, onBack, currentUser }) => {
  const { t } = useTranslation();
  return (
    <>
      <Header title={t('messages')} onBack={onBack} />
      {conversations.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-neutral-800">
          {conversations.map(convo => {
            const unreadCount = convo.unreadCount?.[currentUser.id] || 0;
            return (
              <div key={convo.id} onClick={() => onSelectConversation(convo.participant)} className="p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                <img src={convo.participant.avatarUrl} alt={convo.participant.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                     <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{convo.participant.name}</p>
                     {convo.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {convo.lastMessage && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage.text}</p>}
                    {unreadCount > 0 && (
                      <span className="ms-2 flex-shrink-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">No conversations yet.</p>
      )}
    </>
  );
};

export default ChatScreen;
