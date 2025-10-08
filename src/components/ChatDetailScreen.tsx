import React, { useState, useEffect, useRef } from 'react';
import { User, Message, HydratedConversation } from '../types';
import Header from './Header';
import ChatInput from './ChatInput';
import MessageOptionsMenu from './MessageOptionsMenu';
import { db, collection, query, orderBy, onSnapshot } from '../services/firebase';
import { useTranslation } from '../contexts/LanguageContext';
import MoreIcon from './icons/MoreIcon';
import PlayIcon from './icons/PlayIcon';

interface ChatDetailScreenProps {
  conversation: HydratedConversation;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onSendMessage: (conversation: HydratedConversation, content: Message['content'], mediaFile?: File) => void;
  onViewProfile: (user: User) => void;
  onOpenSettings: (conversation: HydratedConversation) => void;
  onUnsendMessage: (conversationId: string, messageId: string) => void;
  onDeleteMessageForMe: (conversationId: string, messageId: string) => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ 
    conversation, currentUser, allUsers, onBack, onSendMessage, onViewProfile, onOpenSettings, onUnsendMessage, onDeleteMessageForMe 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  
  useEffect(() => {
    const messagesQuery = query(collection(db, 'conversations', conversation.id, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: safeTimestampToString(data.createdAt),
        } as Message
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const safeTimestampToString = (timestamp: any): string => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return t('notifications.today');
    if (isSameDay(date, yesterday)) return t('notifications.yesterday');
    return date.toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  let lastMessageDate: Date | null = null;
  const participant = conversation.participant;
  const headerTitle = conversation.type === 'private' ? participant?.name : conversation.name;
  const avatarUrl = conversation.type === 'private' ? participant?.avatarUrl : conversation.imageUrl;

  const visibleMessages = messages.filter(msg => !msg.isDeletedFor?.includes(currentUser.id));

  const headerSettingsAction = conversation.type === 'group' ? (
    <button onClick={() => onOpenSettings(conversation)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full">
      <MoreIcon />
    </button>
  ) : undefined;
  
  return (
    <div className="h-full flex flex-col">
      <Header 
        title={headerTitle || ''} 
        onBack={onBack}
        avatarUrl={avatarUrl}
        onTitleClick={conversation.type === 'private' && participant ? () => onViewProfile(participant) : undefined}
        rightAction={headerSettingsAction}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {visibleMessages.map(message => {
          const messageDate = new Date(message.createdAt);
          const showDateSeparator = lastMessageDate === null || !isSameDay(lastMessageDate, messageDate);
          lastMessageDate = messageDate;
          
          if (message.type === 'system') {
              return (
                 <div key={message.id} className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                     {message.content?.text}
                 </div>
              )
          }

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
                {!isMe && sender && (
                  <button onClick={() => onViewProfile(sender)}>
                    <img src={sender.avatarUrl} className="w-6 h-6 rounded-full self-end" alt="avatar" />
                  </button>
                )}
                <div className="flex flex-col" style={{ maxWidth: '75%'}}>
                   {!isMe && conversation.type === 'group' && (
                       <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ms-2">{sender?.name}</span>
                   )}
                   <button onContextMenu={(e) => { e.preventDefault(); setSelectedMessage(message); }} onClick={() => setSelectedMessage(message)}>
                        <MessageBubble message={message} isMe={isMe} language={language} />
                   </button>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} conversation={conversation} />

      {selectedMessage && (
          <MessageOptionsMenu 
            message={selectedMessage}
            currentUser={currentUser}
            onClose={() => setSelectedMessage(null)}
            onUnsend={() => onUnsendMessage(conversation.id, selectedMessage.id)}
            onDeleteForMe={() => onDeleteMessageForMe(conversation.id, selectedMessage.id)}
          />
      )}
    </div>
  );
};

// Message Bubble sub-component
const MessageBubble: React.FC<{ message: Message; isMe: boolean; language: string; }> = ({ message, isMe, language }) => {
    const { content, createdAt } = message;
    
    // Defensive check for messages without content (e.g., old data)
    if (!content) {
        return null;
    }

    const messageDate = new Date(createdAt);

    const renderContent = () => {
        if (content.media) {
            return content.media.type === 'image' 
                ? <img src={content.media.url} alt="media content" className="rounded-lg max-w-full" />
                : <video src={content.media.url} controls className="rounded-lg max-w-full" />;
        }
        if (content.audio) {
            return <AudioPlayer src={content.audio.url} duration={content.audio.duration || 0} isMe={isMe} />;
        }
        if (content.text) {
          return <p className="text-sm" style={{wordBreak: 'break-word'}}>{content.text}</p>;
        }
        return null;
    };

    return (
        <div className={`p-3 rounded-2xl ${isMe ? 'bg-orange-600 text-white rounded-br-lg' : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
            {renderContent()}
            <p className={`text-xs mt-1 text-right ${isMe ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {messageDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
};

// Audio Player sub-component
const AudioPlayer: React.FC<{ src: string; duration: number; isMe: boolean }> = ({ src, duration, isMe }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex items-center space-x-2 w-48">
            <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} preload="metadata" />
            <button onClick={togglePlay}>
                <PlayIcon className={`w-6 h-6 ${isMe ? 'text-white' : 'text-gray-700'}`} style={{ transform: isPlaying ? 'scale(0)' : 'scale(1)', transition: 'transform 0.2s' }} />
                {isPlaying && <div className={`w-6 h-6 flex items-center justify-center ${isMe ? 'text-white' : 'text-gray-700'}`}><span className="w-1.5 h-4 bg-current rounded-sm animate-pulse"></span></div>}
            </button>
            <div className="flex-grow h-1 bg-gray-400/50 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs">{formatDuration(duration)}</span>
        </div>
    );
};


export default ChatDetailScreen;