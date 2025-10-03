import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Adventure, AdventurePrivacy, AdventureType, HydratedAdventure } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface EditAdventureModalProps {
  adventure: HydratedAdventure;
  onClose: () => void;
  onUpdateAdventure: (adventureId: string, updatedData: Partial<Adventure>) => void;
}

const EditAdventureModal: React.FC<EditAdventureModalProps> = ({ adventure, onClose, onUpdateAdventure }) => {
  const { t, language } = useTranslation();
  
  const [adventureType, setAdventureType] = useState<AdventureType>(adventure.type);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(adventure.privacy);
  const [title, setTitle] = useState(adventure.title);
  const [description, setDescription] = useState(adventure.description);
  
  const [location, setLocation] = useState(adventure.location);
  const [locationInput, setLocationInput] = useState(adventure.location);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(adventure.coordinates || null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [budget, setBudget] = useState(adventure.budget.toString());
  const [startDate, setStartDate] = useState(adventure.startDate);
  const [endDate, setEndDate] = useState(adventure.endDate || '');

  const locationRef = useRef<HTMLDivElement>(null);

  const fetchLocations = useCallback(async (input: string) => {
    if (input.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsFetchingLocation(true);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&language=${language}`);
      const data = await response.json();
      if (data.predictions) {
        setLocationSuggestions(data.predictions);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
    setIsFetchingLocation(false);
  }, [language]);

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

  const handleSelectLocation = async (suggestion: any) => {
    setLocation(suggestion.description);
    setLocationInput(suggestion.description);
    setLocationSuggestions([]);
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=geometry&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();
        if(data.result.geometry) {
            setSelectedCoordinates(data.result.geometry.location);
        }
    } catch (error) {
        console.error("Failed to fetch place details:", error);
    }
  };

  const handleSubmit = () => {
    if (!location || !selectedCoordinates) {
        alert(t('selectValidLocation'));
        return;
    }

    const updatedData: Partial<Adventure> = {
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
    
    onUpdateAdventure(adventure.id, updatedData);
    onClose();
  };
  
  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[101] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">{t('editAdventure')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow space-y-4">
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
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} />
            </div>

            <div>
                <label htmlFor="description" className={labelBaseClasses}>{t('description')}</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputBaseClasses}></textarea>
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
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses} />
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
        </div>
        
        <div className="p-4 border-t dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
            <button onClick={handleSubmit} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
            {t('saveChanges')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdventureModal;