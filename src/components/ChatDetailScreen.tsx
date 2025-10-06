import React, { useState, useEffect, useRef } from 'react';
import { User, Message, HydratedConversation } from '../types';
import Header from './Header';
import SendIcon from './icons/SendIcon';
import { db, collection, query, orderBy, onSnapshot, Timestamp } from '../services/firebase';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatDetailScreenProps {
  conversation: HydratedConversation;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onSendMessage: (conversation: HydratedConversation, text: string) => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ conversation, currentUser, allUsers, onBack, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  
  useEffect(() => {
    const messagesQuery = query(collection(db, 'conversations', conversation.id, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
      } as Message));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(conversation, newMessage.trim());
      setNewMessage('');
    }
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return t('notifications.today');
    }
    if (isSameDay(date, yesterday)) {
      return t('notifications.yesterday');
    }
    return date.toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  let lastMessageDate: Date | null = null;
  const headerTitle = conversation.type === 'private' ? conversation.participant?.name : conversation.name;

  return (
    <div className="h-full flex flex-col">
      <Header title={headerTitle || ''} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(message => {
          const messageDate = new Date(message.createdAt);
          const showDateSeparator = lastMessageDate === null || !isSameDay(lastMessageDate, messageDate);
          lastMessageDate = messageDate;
          const sender = allUsers.find(u => u.id === message.senderId);
          const isMe = message.senderId === currentUser.id;

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                      {formatDateSeparator(messageDate)}
                  </div>
              )}
              <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <img src={sender?.avatarUrl} className="w-6 h-6 rounded-full self-end" alt="avatar" />
                )}
                <div className="flex flex-col" style={{ maxWidth: '75%'}}>
                   {!isMe && conversation.type === 'group' && (
                       <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ms-2">{sender?.name}</span>
                   )}
                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-orange-600 text-white rounded-br-lg' : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
                    <p className="text-sm" style={{wordBreak: 'break-word'}}>{message.text}</p>
                    <p className={`text-xs mt-1 text-right ${isMe ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {messageDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t dark:border-zinc-800/50 bg-light-bg-secondary/50 dark:bg-dark-bg/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 p-2 border border-gray-300 rounded-full dark:bg-dark-bg-secondary dark:border-zinc-700 dark:text-white"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-orange-600 text-white p-2.5 rounded-full hover:bg-orange-700">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;