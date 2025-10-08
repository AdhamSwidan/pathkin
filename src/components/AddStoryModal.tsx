
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import BackIcon from './icons/BackIcon';
import { AdventurePrivacy } from '../types';

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreate: (mediaFile: File, privacy: AdventurePrivacy) => void;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({ isOpen, onClose, onStoryCreate }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'options' | 'camera' | 'preview'>('options');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(AdventurePrivacy.Public);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelected = (file: File) => {
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setView('preview');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
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
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile = new File([blob], "story_capture.jpg", { type: "image/jpeg" });
            handleFileSelected(imageFile);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handlePostStory = () => {
    if (previewFile) {
      onStoryCreate(previewFile, privacy);
      handleClose();
    }
  };

  useEffect(() => {
    // Cleanup camera stream when modal is closed
    return () => {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleClose = () => {
      stopCamera();
      setView('options');
      setPreviewFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      setPrivacy(AdventurePrivacy.Public);
      onClose();
  };
  
  const handleBack = () => {
      if (view === 'camera') {
        stopCamera();
        setView('options');
      } else if (view === 'preview') {
        setPreviewFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        setView('options');
      }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (view) {
      case 'options':
        return (
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
        );
      case 'camera':
        return (
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
        );
      case 'preview':
        const isVideo = previewFile?.type.startsWith('video');
        return (
            <div className="w-full aspect-[9/16] relative bg-black rounded-lg overflow-hidden flex flex-col justify-between">
                <button onClick={handleBack} className="absolute top-2 left-2 p-2 text-white z-20"><BackIcon /></button>
                {isVideo ? (
                    <video src={previewUrl} className="w-full h-full object-contain" autoPlay loop playsInline />
                ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent space-y-3">
                    <div>
                        <label htmlFor="story-privacy" className="text-white text-sm font-semibold">{t('storyPrivacy')}</label>
                        <select
                            id="story-privacy"
                            value={privacy}
                            onChange={e => setPrivacy(e.target.value as AdventurePrivacy)}
                            className="w-full mt-1 p-2 bg-black/50 text-white border border-neutral-600 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                            <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                            <option value={AdventurePrivacy.Twins}>{t('AdventurePrivacy_Twins')}</option>
                        </select>
                    </div>
                    <button onClick={handlePostStory} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
                        {t('postStory')}
                    </button>
                </div>
            </div>
        )
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[101] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm flex flex-col relative">
        <button onClick={handleClose} className="absolute top-2 end-2 p-2 text-gray-400 hover:text-white text-2xl font-bold z-20">&times;</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default AddStoryModal;
