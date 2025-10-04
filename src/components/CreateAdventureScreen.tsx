import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import { AdventureType, Media, AdventurePrivacy, Adventure, User } from '../types';
import { generateDescription } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';
import LocationPickerModal from './LocationPickerModal';
import MapPinIcon from './icons/MapPinIcon';

interface CreateAdventureScreenProps {
  currentUser: User;
  onCreateAdventure: (adventure: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => void;
  isLoaded: boolean;
}

const LocationInput: React.FC<{
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onCoordsChange: (coords: { lat: number, lng: number } | null) => void;
  onLocationSelectFromMap: (address: string, coords: { lat: number; lng: number; }) => void;
  isLoaded: boolean;
}> = ({ label, value, onValueChange, onCoordsChange, onLocationSelectFromMap, isLoaded }) => {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedName, setSelectedName] = useState(value);
    const locationRef = useRef<HTMLDivElement>(null);
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
            setSuggestions([]);
            return;
        }
        setIsFetching(true);
        autocompleteService.getPlacePredictions({ input }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
            } else {
                setSuggestions([]);
            }
            setIsFetching(false);
        });
    }, [autocompleteService]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (value.trim() !== selectedName) {
                fetchLocations(value);
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timerId);
    }, [value, selectedName, fetchLocations]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
        onValueChange(suggestion.description);
        setSelectedName(suggestion.description);
        setSuggestions([]);
        if (!placesService) return;
        placesService.getDetails({ placeId: suggestion.place_id, fields: ['geometry'] }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                onCoordsChange({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            }
        });
    };
    
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <div className="flex items-center space-x-2">
                    <div ref={locationRef} className="relative flex-grow">
                        <input type="text" value={value}
                            onChange={e => {
                                onValueChange(e.target.value);
                                onCoordsChange(null);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200"
                        />
                        {isFetching && <div className="p-2 text-xs text-gray-500">{t('searching')}</div>}
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {suggestions.map(s => (
                                    <li key={s.place_id} onClick={() => handleSelectSuggestion(s)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer">
                                        {s.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button onClick={() => setIsPickerOpen(true)} className="p-2 bg-gray-200 dark:bg-neutral-700 rounded-md" aria-label={t('selectOnMap')}>
                        <MapPinIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div ref={placesAttributionRef} style={{ display: 'none' }}></div>
            {isLoaded && <LocationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onLocationSelect={onLocationSelectFromMap} />}
        </>
    );
};


const CreateAdventureScreen: React.FC<CreateAdventureScreenProps> = ({ onCreateAdventure, isLoaded }) => {
  // Common State
  const [adventureType, setAdventureType] = useState<AdventureType>(AdventureType.Travel);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(AdventurePrivacy.Public);
  const [subPrivacy, setSubPrivacy] = useState<AdventurePrivacy.Public | AdventurePrivacy.Followers>(AdventurePrivacy.Public);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic State
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [otherEventCategory, setOtherEventCategory] = useState('');
  const [destinations, setDestinations] = useState<{ location: string; coordinates: { lat: number; lng: number } | null }[]>([]);
  const [endLocation, setEndLocation] = useState('');
  const [endCoordinates, setEndCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Reset dynamic fields when adventure type changes
    setLocation(''); setCoordinates(null);
    setStartDate(''); setEndDate('');
    setBudget(''); setRoomCount('');
    setEventCategory(''); setOtherEventCategory('');
    setDestinations([]); setEndLocation(''); setEndCoordinates(null);
  }, [adventureType]);

  const handleGenerateDescription = async () => {
    if (!title || !keywords) return;
    setIsGenerating(true);
    const generated = await generateDescription(title, keywords, adventureType);
    setDescription(generated);
    setIsGenerating(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setMediaPreview({ url, type });
    }
  };
  
  const handleSubmit = () => {
    // Basic validation
    if (!title || !description) {
        alert("Please add a title and description.");
        return;
    }
    
    let adventureData: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'> = {
      type: adventureType,
      privacy,
      ...(privacy === AdventurePrivacy.Twins && { subPrivacy }),
      title,
      description,
      location,
      coordinates: coordinates ?? undefined,
      startDate,
      endDate: endDate || undefined,
      budget: parseInt(budget, 10) || 0,
    };
    
    // Add type-specific data
    switch (adventureType) {
        case AdventureType.Travel:
            adventureData.destinations = destinations.filter(d => d.location && d.coordinates) as { location: string; coordinates: { lat: number; lng: number; }}[];
            break;
        case AdventureType.Housing:
            adventureData.budget = parseInt(budget, 10) || 0; // Price
            adventureData.roomCount = parseInt(roomCount, 10) || undefined;
            break;
        case AdventureType.Event:
            adventureData.eventCategory = eventCategory === 'Other' ? otherEventCategory : eventCategory;
            break;
        case AdventureType.Hiking:
        case AdventureType.Cycling:
            adventureData.endLocation = endLocation;
            adventureData.endCoordinates = endCoordinates ?? undefined;
            break;
    }
    
    onCreateAdventure(adventureData, mediaFile);
  };

  const handleAddDestination = () => {
    setDestinations([...destinations, { location: '', coordinates: null }]);
  };
  
  const handleDestinationChange = (index: number, newLocation: string, newCoords: { lat: number; lng: number } | null) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { location: newLocation, coordinates: newCoords };
    setDestinations(newDestinations);
  };

  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  
  const renderDynamicFields = () => {
    switch(adventureType) {
      case AdventureType.Travel:
        return (
          <>
            <LocationInput label={t('fromLocation')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onLocationSelectFromMap={(addr, coords) => {setLocation(addr); setCoordinates(coords);}} isLoaded={isLoaded}/>
            <div>
              <label className={labelBaseClasses}>{t('destinations')}</label>
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <LocationInput key={index} label={`${t('to')} #${index + 1}`} value={dest.location} onValueChange={(val) => handleDestinationChange(index, val, null)} onCoordsChange={(coords) => handleDestinationChange(index, dest.location, coords)} onLocationSelectFromMap={(addr, coords) => handleDestinationChange(index, addr, coords)} isLoaded={isLoaded} />
                ))}
              </div>
              <button onClick={handleAddDestination} className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700">{t('addDestination')}</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelBaseClasses}>{t('startDate')}</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
                <div><label className={labelBaseClasses}>{t('endDate')}</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
            </div>
            <div><label className={labelBaseClasses}>{t('budget')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>
          </>
        );
      case AdventureType.Housing:
         return (
          <>
            <LocationInput label={t('location')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onLocationSelectFromMap={(addr, coords) => {setLocation(addr); setCoordinates(coords);}} isLoaded={isLoaded}/>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelBaseClasses}>{t('price')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>
                <div><label className={labelBaseClasses}>{t('roomCount')}</label><input type="number" value={roomCount} onChange={e => setRoomCount(e.target.value)} className={inputBaseClasses}/></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className={labelBaseClasses}>{t('availableFrom')}</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
                <div><label className={labelBaseClasses}>{t('availableTo')}</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
            </div>
          </>
        );
      case AdventureType.Event:
        return (
          <>
            <LocationInput label={t('location')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onLocationSelectFromMap={(addr, coords) => {setLocation(addr); setCoordinates(coords);}} isLoaded={isLoaded}/>
            <div>
              <label className={labelBaseClasses}>{t('eventCategory')}</label>
              <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} className={inputBaseClasses}>
                  <option value="">{t('selectCategory')}</option>
                  <option value="Music">{t('categoryMusic')}</option>
                  <option value="Art">{t('categoryArt')}</option>
                  <option value="Food">{t('categoryFood')}</option>
                  <option value="Sports">{t('categorySports')}</option>
                  <option value="Other">{t('categoryOther')}</option>
              </select>
            </div>
            {eventCategory === 'Other' && (
              <div><label className={labelBaseClasses}>{t('otherCategory')}</label><input type="text" value={otherEventCategory} onChange={e => setOtherEventCategory(e.target.value)} className={inputBaseClasses}/></div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelBaseClasses}>{t('startDate')}</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
              <div><label className={labelBaseClasses}>{t('budget')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>
            </div>
          </>
        );
      case AdventureType.Hiking:
      case AdventureType.Cycling:
        return (
          <>
            <LocationInput label={t('startPoint')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onLocationSelectFromMap={(addr, coords) => {setLocation(addr); setCoordinates(coords);}} isLoaded={isLoaded}/>
            <LocationInput label={t('endPoint')} value={endLocation} onValueChange={setEndLocation} onCoordsChange={setEndCoordinates} onLocationSelectFromMap={(addr, coords) => {setEndLocation(addr); setEndCoordinates(coords);}} isLoaded={isLoaded}/>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelBaseClasses}>{t('startDate')}</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
              <div><label className={labelBaseClasses}>{t('budget')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>
            </div>
          </>
        );
      default:
        return (
          <>
            <LocationInput label={t('location')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onLocationSelectFromMap={(addr, coords) => {setLocation(addr); setCoordinates(coords);}} isLoaded={isLoaded}/>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelBaseClasses}>{t('startDate')}</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
                <div><label className={labelBaseClasses}>{t('endDate')}</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/></div>
            </div>
            <div><label className={labelBaseClasses}>{t('budget')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>
          </>
        );
    }
  };

  return (
    <>
      <Header title={t('createANewAdventure')} />
      <div className="p-4 space-y-4">
        {/* --- Common Fields --- */}
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
        
        {privacy === AdventurePrivacy.Twins && (
          <div>
            <label className={labelBaseClasses}>{t('subPrivacyLabel')}</label>
            <select value={subPrivacy} onChange={e => setSubPrivacy(e.target.value as AdventurePrivacy.Public)} className={inputBaseClasses}>
              <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
              <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="title" className={labelBaseClasses}>{t('title')}</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses}/>
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
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputBaseClasses}></textarea>
        </div>
        
        <div>
          <label className={labelBaseClasses}>{t('addMedia')}</label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden"/>
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 dark:bg-neutral-700 py-2 rounded-md text-sm">{t('uploadMedia')}</button>
           {mediaPreview && (
            <div className="mt-2 p-2 border dark:border-neutral-700 rounded-md relative">
              {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="rounded w-full" /> : <video src={mediaPreview.url} className="rounded w-full" controls />}
            </div>
          )}
        </div>
        
        {/* --- Dynamic Fields --- */}
        {renderDynamicFields()}
        
        <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors">
          {t('publishAdventure')}
        </button>
      </div>
    </>
  );
};

export default CreateAdventureScreen;