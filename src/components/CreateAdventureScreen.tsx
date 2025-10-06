
import React, { useState, useRef } from 'react';
import Header from './Header';
import { AdventureType, Media, AdventurePrivacy, Adventure, User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import LocationPickerModal from './LocationPickerModal';
import TitleIcon from './icons/TitleIcon';
import CalendarIcon from './icons/CalendarIcon';
import PencilIcon from './icons/PencilIcon';
import ImageIcon from './icons/ImageIcon';
import CategoryIcon from './icons/CategoryIcon';
import PrivacyIcon from './icons/PrivacyIcon';
import MapPinIcon from './icons/MapPinIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import ListIcon from './icons/ListIcon';
import FormCard from './FormCard';

interface CreateAdventureScreenProps {
  currentUser: User;
  onCreateAdventure: (adventure: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => void;
  isLoaded: boolean;
}

// Chip component for categories and image options
const Chip: React.FC<{ children: React.ReactNode; isSelected?: boolean; onClick: () => void; className?: string; }> = ({ children, isSelected = false, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
      isSelected
        ? 'bg-brand-orange/10 dark:bg-brand-orange/20 border-brand-orange text-brand-orange'
        : 'bg-slate-100 dark:bg-zinc-800 border-transparent hover:border-slate-300 dark:hover:border-zinc-600 text-gray-700 dark:text-gray-300'
    } ${className}`}
  >
    {children}
  </button>
);


const CreateAdventureScreen: React.FC<CreateAdventureScreenProps> = ({ onCreateAdventure, isLoaded }) => {
  // Common State
  const [adventureType, setAdventureType] = useState<AdventureType>(AdventureType.Travel);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(AdventurePrivacy.Public);
  const [subPrivacy, setSubPrivacy] = useState<AdventurePrivacy.Public | AdventurePrivacy.Followers>(AdventurePrivacy.Public);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Dynamic State
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const inputClasses = "w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-zinc-900 text-gray-800 dark:text-gray-200 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500";
  
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

  return (
    <>
      <Header title={t('createANewAdventure')} />
      <div className="p-2 sm:p-4 space-y-3 overflow-y-auto">
        
        <FormCard icon={<CategoryIcon />} title={`${t('adventure')}*`}>
          <div className="flex flex-wrap gap-2">
            {adventureTypes.map(type => (
              <Chip key={type} isSelected={adventureType === type} onClick={() => setAdventureType(type)}>
                {t(`AdventureType_${type}`)}
              </Chip>
            ))}
          </div>
        </FormCard>

        <FormCard icon={<PrivacyIcon />} title={t('privacy')}>
            <select value={privacy} onChange={e => setPrivacy(e.target.value as AdventurePrivacy)} className={inputClasses}>
              <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
              <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
              <option value={AdventurePrivacy.Twins}>{t('AdventurePrivacy_Twins')}</option>
            </select>
             {privacy === AdventurePrivacy.Twins && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ms-1">{t('subPrivacyLabel')}</label>
                <select value={subPrivacy} onChange={e => setSubPrivacy(e.target.value as AdventurePrivacy.Public | AdventurePrivacy.Followers)} className={inputClasses}>
                  <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                  <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                </select>
              </div>
            )}
        </FormCard>

        <FormCard icon={<TitleIcon />} title={t('title')}>
          <input type="text" id="title" placeholder="Adventure on the mountain" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses}/>
        </FormCard>

        <FormCard icon={<PencilIcon />} title="Description*">
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className={inputClasses} placeholder="We are going on a full day excursion..."></textarea>
        </FormCard>
        
        <FormCard icon={<ImageIcon />} title="Media*" subtitle="Select an image or video. More quality, more visibility!">
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => fileInputRef.current?.click()} isSelected={!!mediaFile}>Gallery</Chip>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden"/>
          {mediaPreview && (
            <div className="mt-4 p-2 border-2 border-dashed dark:border-zinc-700 rounded-2xl relative">
              <img src={mediaPreview.url} className="rounded-xl w-full" alt="Preview"/>
            </div>
          )}
        </FormCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormCard icon={<CalendarIcon />} title={t('startDate')}>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputClasses} text-gray-500`} />
            </FormCard>
            <FormCard icon={<CalendarIcon />} title={t('endDate')}>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputClasses} text-gray-500`} />
            </FormCard>
        </div>

        <FormCard icon={<MapPinIcon />} title="Meeting Point*">
          <button 
            onClick={() => setIsPickerOpen(true)} 
            className={`${inputClasses} text-left ${location ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {location || '+ Select meeting point'}
          </button>
        </FormCard>
        
        {adventureType === AdventureType.Event && (
            <FormCard icon={<ListIcon />} title={t('eventCategory')}>
                <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} className={inputClasses}>
                    <option value="">{t('selectCategory')}</option>
                    <option value="Music">{t('categoryMusic')}</option>
                    <option value="Art">{t('categoryArt')}</option>
                    <option value="Food">{t('categoryFood')}</option>
                    <option value="Sports">{t('categorySports')}</option>
                    <option value="Other">{t('categoryOther')}</option>
                </select>
            </FormCard>
        )}

        <FormCard icon={<DollarSignIcon />} title={t('budget')}>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputClasses} placeholder="0"/>
        </FormCard>

        <button onClick={handleSubmit} className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-orange-light transition-colors text-lg">
          {t('publishAdventure')}
        </button>
      </div>

      {isLoaded && <LocationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onLocationSelect={handleLocationSelect} />}
    </>
  );
};

export default CreateAdventureScreen;
