

import React, { useState, useRef } from 'react';
import { AdventureType, Media, AdventurePrivacy, Adventure, User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import LocationPickerModal from './LocationPickerModal';
import { generateDescription } from '../services/geminiService';
import ImageIcon from './icons/ImageIcon';

interface CreateAdventureScreenProps {
  currentUser: User;
  onCreateAdventure: (adventure: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => void;
  isLoaded: boolean;
}

const CreateAdventureScreen: React.FC<CreateAdventureScreenProps> = ({ currentUser, onCreateAdventure, isLoaded }) => {
  // Common State
  const [adventureType, setAdventureType] = useState<AdventureType>(AdventureType.Travel);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(AdventurePrivacy.Public);
  const [subPrivacy, setSubPrivacy] = useState<AdventurePrivacy.Public | AdventurePrivacy.Followers>(AdventurePrivacy.Public);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic State
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setMediaPreview({ url, type });
    }
  };

  const handleLocationSelect = (address: string, coords: { lat: number; lng: number; }) => {
    setLocation(address);
    setCoordinates(coords);
    setIsPickerOpen(false);
  };
  
  const handleGenerateDescription = async () => {
    if (!title && !keywords) {
      alert("Please enter a title or some keywords first.");
      return;
    }
    setIsGenerating(true);
    try {
      const generatedDesc = await generateDescription(title, keywords, adventureType);
      setDescription(generatedDesc);
    } catch (error) {
      console.error(error);
      alert("Failed to generate description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!title || !description || !location || !startDate) {
        alert("Please fill in all required fields: title, description, location, and start date.");
        return;
    }
    
    const adventureData: any = { type: adventureType, privacy, title, description, location, startDate, budget: parseInt(budget, 10) || 0, };
    
    if (privacy === AdventurePrivacy.Twins) adventureData.subPrivacy = subPrivacy;
    if (coordinates) adventureData.coordinates = coordinates;
    if (endDate) adventureData.endDate = endDate;
    if (eventCategory) adventureData.eventCategory = eventCategory;
    
    onCreateAdventure(adventureData, mediaFile);
  };

  const adventureTypes = Object.values(AdventureType);
  const inputBaseClasses = "w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 focus:ring-brand-orange focus:border-brand-orange";
  const tagButtonClasses = "px-2 py-1 rounded-full text-xs font-semibold";

  return (
    <>
      <div className="p-2 sm:p-4 space-y-4">
        <h1 className="text-2xl font-bold px-2 text-gray-800 dark:text-gray-100">{t('createANewAdventure')}</h1>
        {/* Live Preview Card */}
        <div className="bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-black/[.02] dark:shadow-black/[.05]">
          {/* Header */}
          <div className="p-4 flex items-center space-x-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 dark:text-gray-100">{currentUser.name}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <select value={privacy} onChange={e => setPrivacy(e.target.value as AdventurePrivacy)} className="bg-transparent border-none p-0 focus:ring-0">
                  <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                  <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                  <option value={AdventurePrivacy.Twins}>{t('AdventurePrivacy_Twins')}</option>
                </select>
                 {privacy === AdventurePrivacy.Twins && (
                    <>
                    <span>+</span>
                    <select value={subPrivacy} onChange={e => setSubPrivacy(e.target.value as AdventurePrivacy.Public | AdventurePrivacy.Followers)} className="bg-transparent border-none p-0 focus:ring-0">
                        <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                        <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                    </select>
                    </>
                 )}
              </div>
            </div>
          </div>
          {/* Content Inputs */}
          <div className="px-4 space-y-2">
            <input type="text" placeholder={t('title')} value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-bold w-full bg-transparent border-none p-0 focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} rows={3} className="text-sm w-full bg-transparent border-none p-0 focus:ring-0 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"></textarea>
            {/* AI Helper */}
            <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg space-y-2">
              <label htmlFor="keywords" className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('aiDescriptionHelper')}</label>
              <div className="flex space-x-2">
                <input id="keywords" type="text" placeholder={t('keywords')} value={keywords} onChange={e => setKeywords(e.target.value)} className="flex-grow text-sm bg-white dark:bg-zinc-900 rounded-md px-2 py-1 border-gray-300 dark:border-zinc-700 focus:ring-1 focus:ring-brand-orange"/>
                <button onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm bg-brand-orange text-white px-3 py-1 rounded-md font-semibold disabled:bg-brand-orange-light">
                  {isGenerating ? t('generating') : t('generateWithAI')}
                </button>
              </div>
            </div>
          </div>

          {/* Media Input */}
          <div className="p-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden"/>
            <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-100 dark:bg-zinc-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-brand-orange transition-colors">
              {mediaPreview ? (
                 <div className="w-full h-full relative">
                    {mediaPreview.type === 'image' ? (
                       <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-cover rounded-2xl"/>
                    ) : (
                       <video src={mediaPreview.url} className="w-full h-full object-cover rounded-2xl" playsInline muted loop/>
                    )}
                 </div>
              ) : (
                 <>
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="font-semibold">{t('addMedia')}</span>
                 </>
              )}
            </button>
          </div>

          {/* Details Footer */}
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('adventureType')}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {adventureTypes.map(type => (
                  <button key={type} onClick={() => setAdventureType(type)} className={`${tagButtonClasses} ${adventureType === type ? 'bg-brand-orange text-white' : 'bg-slate-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}>
                    {t(`AdventureType_${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {adventureType === AdventureType.Event && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('eventCategory')}</label>
                <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} className={`${inputBaseClasses} mt-2`}>
                    <option value="">{t('selectCategory')}</option>
                    <option value="Music">{t('categoryMusic')}</option>
                    <option value="Art">{t('categoryArt')}</option>
                    <option value="Food">{t('categoryFood')}</option>
                    <option value="Sports">{t('categorySports')}</option>
                    <option value="Other">{t('categoryOther')}</option>
                </select>
              </div>
            )}

            <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('location')}</label>
                <button onClick={() => setIsPickerOpen(true)} className="w-full mt-2 text-left p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800">
                  {location || t('selectOnMap')}
                </button>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('startDate')}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} mt-2 text-gray-500`} />
                </div>
                 <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('endDate')}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} mt-2 text-gray-500`} />
                </div>
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('budget')}</label>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={`${inputBaseClasses} mt-2`} placeholder="0"/>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-orange-light transition-colors text-lg">
          {t('publishAdventure')}
        </button>
      </div>
      {isLoaded && <LocationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onLocationSelect={handleLocationSelect} />}
    </>
  );
};

export default CreateAdventureScreen;