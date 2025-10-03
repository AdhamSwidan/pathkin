import React, { useState, useRef } from 'react';
import Header from './Header';
import { PostType, Media, PostPrivacy, Post, User } from '../types';
import { generateDescription } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

interface CreatePostScreenProps {
  currentUser: User;
  onCreatePost: (post: Omit<Post, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => void;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onCreatePost }) => {
  const [postType, setPostType] = useState<PostType>(PostType.Travel);
  const [privacy, setPrivacy] = useState<PostPrivacy>(PostPrivacy.Public);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleGenerateDescription = async () => {
    if (!title || !keywords) {
      alert("Please enter a title and some keywords first.");
      return;
    }
    setIsGenerating(true);
    const generated = await generateDescription(title, keywords);
    setDescription(generated);
    setIsGenerating(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaPreview({ url, type });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = () => {
    if (!title || !description || !location || !startDate || !budget) {
      alert("Please fill in all required fields: Title, Description, Location, Start Date, and Budget.");
      return;
    }
    
    // @ts-ignore
    const newPostData = {
      type: postType,
      privacy,
      title,
      description,
      location,
      startDate,
      endDate: endDate || undefined,
      budget: parseInt(budget, 10),
    };
    
    onCreatePost(newPostData, mediaFile);
  };

  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <>
      <Header title={t('createANewPost')} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelBaseClasses}>{t('postType')}</label>
            <select value={postType} onChange={e => setPostType(e.target.value as PostType)} className={inputBaseClasses}>
              <option value={PostType.Travel}>{t('PostType_Travel')}</option>
              <option value={PostType.Housing}>{t('PostType_Housing')}</option>
              <option value={PostType.Event}>{t('PostType_Event')}</option>
              <option value={PostType.Hiking}>{t('PostType_Hiking')}</option>
              <option value={PostType.Camping}>{t('PostType_Camping')}</option>
              <option value={PostType.Volunteering}>{t('PostType_Volunteering')}</option>
              <option value={PostType.Cycling}>{t('PostType_Cycling')}</option>
            </select>
          </div>
           <div>
            <label className={labelBaseClasses}>{t('privacy')}</label>
            <select value={privacy} onChange={e => setPrivacy(e.target.value as PostPrivacy)} className={inputBaseClasses}>
              <option value={PostPrivacy.Public}>{t('PostPrivacy_Public')}</option>
              <option value={PostPrivacy.Followers}>{t('PostPrivacy_Followers')}</option>
              <option value={PostPrivacy.Twins}>{t('PostPrivacy_Twins')}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="title" className={labelBaseClasses}>{t('title')}</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} placeholder="e.g., Backpacking trip in Peru" />
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
           <label htmlFor="keywords" className={labelBaseClasses}>{t('aiDescriptionHelper')}</label>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('aiHelperPrompt')}</p>
           <input type="text" id="keywords" value={keywords} onChange={e => setKeywords(e.target.value)} className={`${inputBaseClasses} mb-2`} placeholder={t('keywords')} />
           <button onClick={handleGenerateDescription} disabled={isGenerating} className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300">
             {isGenerating ? t('generating') : t('generateWithAI')}
           </button>
        </div>
        
        <div>
          <label htmlFor="description" className={labelBaseClasses}>{t('description')}</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputBaseClasses} placeholder="Describe your plans, offer, or event..."></textarea>
        </div>
        
        <div>
          <label className={labelBaseClasses}>{t('addMedia')}</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 text-sm"
          >
            {t('uploadMedia')}
          </button>
           {mediaPreview && (
            <div className="mt-2 p-2 border dark:border-neutral-700 rounded-md relative">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('mediaPreview')}</p>
              {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="rounded w-full" /> : <video src={mediaPreview.url} className="rounded w-full" controls />}
              <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBaseClasses}>{t('location')}</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputBaseClasses} placeholder="e.g., Cusco, Peru" />
            </div>
            <div>
              <label className={labelBaseClasses}>{t('budget')}</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses} placeholder="e.g., 1500" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBaseClasses}>{t('startDate')}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`} />
            </div>
            <div>
              <label className={labelBaseClasses}>{t('endDate')}</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`} />
            </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors">
          {t('publishPost')}
        </button>
      </div>
    </>
  );
};

export default CreatePostScreen;