import React, { useState, useRef } from 'react';
import { HydratedConversation, Message } from '../types';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import MicIcon from './icons/MicIcon';
import TrashIcon from './icons/TrashIcon';

interface ChatInputProps {
  conversation: HydratedConversation;
  onSendMessage: (conversation: HydratedConversation, content: Message['content'], mediaFile?: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ conversation, onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const handleSendText = () => {
    if (text.trim()) {
      onSendMessage(conversation, { text: text.trim() });
      setText('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isAudio = file.type.startsWith('audio');
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');

      if (isAudio || isVideo || isImage) {
        onSendMessage(conversation, {}, file);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
        onSendMessage(conversation, { audio: { url: '', duration: recordingTime } }, audioFile);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied. Please allow it in your browser settings.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  const cancelRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          // Stop without triggering the onstop handler's sending logic
          mediaRecorderRef.current.ondataavailable = null;
          mediaRecorderRef.current.onstop = () => {
              mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          };
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
  };

  const formatRecordingTime = (time: number) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const renderInputArea = () => {
    if (isRecording) {
      return (
        <div className="flex items-center w-full bg-slate-100 dark:bg-zinc-800 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="flex-grow text-center text-sm font-mono text-gray-700 dark:text-gray-300">{formatRecordingTime(recordingTime)}</p>
            <button onClick={cancelRecording} className="p-2 text-gray-500 hover:text-red-500">
                <TrashIcon className="w-5 h-5" />
            </button>
            <button onClick={stopRecording} className="p-2 rounded-full bg-green-500 text-white">
                <SendIcon className="w-5 h-5"/>
            </button>
        </div>
      );
    }

    return (
      <>
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand-orange">
          <PaperclipIcon />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange dark:text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
        />

        {text ? (
          <button onClick={handleSendText} className="p-2.5 rounded-full bg-brand-orange text-white hover:bg-brand-orange-light transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        ) : (
          <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand-orange">
            <MicIcon />
          </button>
        )}
      </>
    );
  };

  return (
    <div className="p-2 border-t dark:border-zinc-800/50 bg-light-bg-secondary/50 dark:bg-dark-bg/50 backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        {renderInputArea()}
      </div>
    </div>
  );
};

export default ChatInput;