import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import BackIcon from './icons/BackIcon';
import { Media } from '../types';

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreate: (media: Media) => void;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({ isOpen, onClose, onStoryCreate }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'options' | 'camera'>('options');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        onStoryCreate({ url, type });
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setView('camera');
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onStoryCreate({ url: dataUrl, type: 'image' });
        onClose();
      }
    }
  };

  useEffect(() => {
    // Cleanup camera stream when modal is closed or view changes
    return () => {
      stopCamera();
    };
  }, []);
  
  const handleClose = () => {
      stopCamera();
      setView('options');
      onClose();
  };
  
  const handleBack = () => {
      stopCamera();
      setView('options');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[101] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm flex flex-col relative">
        <button onClick={handleClose} className="absolute top-2 end-2 p-2 text-gray-400 hover:text-white text-2xl font-bold z-20">&times;</button>
        
        {view === 'options' && (
          <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-white mb-6 text-center">{t('addStory')}</h2>
            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white font-semibold transition-colors"
            >
              <CameraIcon className="w-6 h-6 me-3" />
              <span>{t('takePhoto')}</span>
            </button>
            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white font-semibold transition-colors"
            >
              <UploadIcon className="w-6 h-6 me-3" />
              <span>{t('uploadFromDevice')}</span>
            </button>
          </div>
        )}
        
        {view === 'camera' && (
          <div className="w-full aspect-[9/16] relative bg-black rounded-lg overflow-hidden">
            <button onClick={handleBack} className="absolute top-2 left-2 p-2 text-white z-20"><BackIcon /></button>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white border-4 border-neutral-500"
                aria-label={t('capture')}
              ></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStoryModal;