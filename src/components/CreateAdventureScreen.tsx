import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import { AdventureType, Media, AdventurePrivacy, Adventure, User } from '../types';
import { generateDescription } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

interface CreateAdventureScreenProps {
  currentUser: User;
  onCreateAdventure: (adventure: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => void;
  isLoaded: boolean;
}

const CreateAdventureScreen: React.FC<CreateAdventureScreenProps> = ({ onCreateAdventure, isLoaded }) => {
  const [adventureType, setAdventureType] = useState<AdventureType>(AdventureType.Travel);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(AdventurePrivacy.Public);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const placesAttributionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && window.google) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      if (placesAttributionRef.current) {
        setPlacesService(new window.google.maps.places.PlacesService(placesAttributionRef.current));
      }
    }
  }, [isLoaded]);

  const fetchLocations = useCallback((input: string) => {
    if (!autocompleteService || input.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsFetchingLocation(true);
    autocompleteService.getPlacePredictions({ input, types: ['(cities)'] }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setLocationSuggestions(predictions);
      } else {
        setLocationSuggestions([]);
      }
      setIsFetchingLocation(false);
    });
  }, [autocompleteService]);

  // Debounce effect for location search
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (locationInput.trim() !== location) {
        fetchLocations(locationInput);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [locationInput, location, fetchLocations]);

  // Effect to close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
            setLocationSuggestions([]);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setLocation(suggestion.description);
    setLocationInput(suggestion.description);
    setLocationSuggestions([]);
    if (!placesService) return;
    placesService.getDetails({ placeId: suggestion.place_id, fields: ['geometry'] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        setSelectedCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  };

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
    if (!title || !description || !startDate || !budget) {
      alert("Please fill in all required fields: Title, Description, Start Date, and Budget.");
      return;
    }

    if (!location || !selectedCoordinates) {
        alert(t('selectValidLocation'));
        return;
    }
    
    const newAdventureData: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'> = {
      type: adventureType,
      privacy,
      title,
      description,
      location,
      coordinates: selectedCoordinates,
      startDate,
      endDate: endDate || undefined,
      budget: parseInt(budget, 10),
    };
    
    onCreateAdventure(newAdventureData, mediaFile);
  };

  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <>
      <Header title={t('createANewAdventure')} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelBaseClasses}>{t('adventureType')}</label>
            <select value={adventureType} onChange={e => setAdventureType(e.target.value as AdventureType)} className={inputBaseClasses}>
              <option value={AdventureType.Travel}>{t('AdventureType_Travel')}</option>
              <option value={AdventureType.Housing}>{t('AdventureType_Housing')}</option>
              <option value={AdventureType.Event}>{t('AdventureType_Event')}</option>
              <option value={AdventureType.Hiking}>{t('AdventureType_Hiking')}</option>
              <option value={AdventureType.Camping}>{t('AdventureType_Camping')}</option>
              <option value={AdventureType.Volunteering}>{t('AdventureType_Volunteering')}</option>
              <option value={AdventureType.Cycling}>{t('AdventureType_Cycling')}</option>
            </select>
          </div>
           <div>
            <label className={labelBaseClasses}>{t('privacy')}</label>
            <select value={privacy} onChange={e => setPrivacy(e.target.value as AdventurePrivacy)} className={inputBaseClasses}>
              <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
              <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
              <option value={AdventurePrivacy.Twins}>{t('AdventurePrivacy_Twins')}</option>
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
        
        <div ref={locationRef} className="relative">
          <label className={labelBaseClasses}>{t('location')}</label>
          <input 
              type="text" 
              value={locationInput} 
              onChange={e => {
                  setLocationInput(e.target.value);
                  setSelectedCoordinates(null);
                  setLocation('');
              }} 
              className={inputBaseClasses} 
              placeholder="e.g., Barcelona, Spain" 
          />
          {isFetchingLocation && <div className="p-2 text-xs text-gray-500">{t('searching')}</div>}
          {locationSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map(s => (
                      <li key={s.place_id} onClick={() => handleSelectLocation(s)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer">
                          {s.description}
                      </li>
                  ))}
              </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBaseClasses}>{t('budget')}</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses} placeholder="e.g., 1500" />
            </div>
            <div>
              <label className={labelBaseClasses}>{t('startDate')}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`} />
            </div>
        </div>
        <div>
          <label className={labelBaseClasses}>{t('endDate')}</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`} />
        </div>

        <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors">
          {t('publishAdventure')}
        </button>
      </div>
      <div ref={placesAttributionRef} style={{ display: 'none' }}></div>
    </>
  );
};

export default CreateAdventureScreen;