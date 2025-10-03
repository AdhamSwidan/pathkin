import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import Header from './Header';
import SendIcon from './icons/SendIcon';
import { db, collection, query, orderBy, onSnapshot, Timestamp } from '../services/firebase';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatDetailScreenProps {
  participant: User;
  currentUser: User;
  onBack: () => void;
  onSendMessage: (receiverId: string, text: string) => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ participant, currentUser, onBack, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  
  const convoId = [currentUser.id, participant.id].sort().join('_');

  useEffect(() => {
    const messagesQuery = query(collection(db, 'conversations', convoId, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
      } as Message));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [convoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(participant.id, newMessage.trim());
      setNewMessage('');
    }
  };

  let lastMessageDate: Date | null = null;

  return (
    <div className="h-full flex flex-col">
      <Header title={participant.name} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(message => {
          const messageDate = new Date(message.createdAt);
          const showDateSeparator = lastMessageDate === null || !isSameDay(lastMessageDate, messageDate);
          lastMessageDate = messageDate;

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                      {messageDate.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
              )}
              <div className={`flex items-end gap-2 ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                {message.senderId !== currentUser.id && (
                  <img src={participant.avatarUrl} className="w-6 h-6 rounded-full self-end" alt="avatar" />
                )}
                <div className={`max-w-[75%] sm:max-w-[60%] p-2 px-3 rounded-lg ${message.senderId === currentUser.id ? 'bg-orange-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                  <p className="text-sm" style={{wordBreak: 'break-word'}}>{message.text}</p>
                   <p className={`text-xs mt-1 text-right ${message.senderId === currentUser.id ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {messageDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 p-2 border border-gray-300 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
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