import React, { useState } from 'react';
import { HydratedConversation, User } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatScreenProps {
  conversations: HydratedConversation[];
  onSelectConversation: (conversation: HydratedConversation) => void;
  onBack: () => void;
  currentUser: User;
  onViewProfile: (user: User) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversations, onSelectConversation, onBack, currentUser, onViewProfile }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'adventurers' | 'adventures'>('adventurers');

  // Fix: Removed `&& c.participant` to prevent conversations from disappearing when participant
  // data is still loading. The component now handles potentially undefined participant data gracefully.
  const privateConversations = conversations.filter(c => c.type === 'private');
  const groupConversations = conversations.filter(c => c.type === 'group');
  
  const TabButton: React.FC<{ id: 'adventurers' | 'adventures', label: string }> = ({ id, label }) => {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                isActive
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-orange-500'
            }`}
        >
            {label}
        </button>
    );
  };
  
  const renderList = (list: HydratedConversation[]) => {
    if (list.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-10">No conversations yet.</p>;
    }
    return (
        <div className="p-2 space-y-2">
            {list.map(convo => {
                const unreadCount = convo.unreadCount?.[currentUser.id] || 0;
                const name = convo.type === 'private' ? convo.participant?.name : convo.name;
                const imageUrl = convo.type === 'private' ? convo.participant?.avatarUrl : convo.imageUrl;
                const participant = convo.participant;

                return (
                    <div key={convo.id} onClick={() => onSelectConversation(convo)} className="p-4 rounded-2xl bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-sm flex items-center space-x-4 hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary cursor-pointer transition-colors">
                        <button onClick={(e) => { e.stopPropagation(); if (participant) onViewProfile(participant); }} className="flex-shrink-0">
                          <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        </button>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{name}</p>
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
    );
  };

  return (
    <>
      <Header title={t('messages')} onBack={onBack} />
      <div className="border-b dark:border-neutral-800/50 flex bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-sm sticky top-0 z-30">
        <TabButton id="adventurers" label={t('adventurers')} />
        <TabButton id="adventures" label={t('adventures')} />
      </div>
      {activeTab === 'adventurers' ? renderList(privateConversations) : renderList(groupConversations)}
    </>
  );
};

export default ChatScreen;