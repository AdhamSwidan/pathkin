import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Adventure, AdventurePrivacy, AdventureType, HydratedAdventure } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import LocationPickerModal from './LocationPickerModal';
import MapPinIcon from './icons/MapPinIcon';

interface EditAdventureModalProps {
  adventure: HydratedAdventure;
  onClose: () => void;
  onUpdateAdventure: (adventureId: string, updatedData: Partial<Adventure>) => void;
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
                            <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
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


const EditAdventureModal: React.FC<EditAdventureModalProps> = ({ adventure, onClose, onUpdateAdventure, isLoaded }) => {
  const { t } = useTranslation();
  
  // Common State
  const [adventureType, setAdventureType] = useState<AdventureType>(adventure.type);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(adventure.privacy);
  const [subPrivacy, setSubPrivacy] = useState(adventure.subPrivacy || AdventurePrivacy.Public);
  const [title, setTitle] = useState(adventure.title);
  const [description, setDescription] = useState(adventure.description);
  
  // Dynamic State
  const [location, setLocation] = useState(adventure.location);
  const [coordinates, setCoordinates] = useState(adventure.coordinates || null);
  const [startDate, setStartDate] = useState(adventure.startDate);
  const [endDate, setEndDate] = useState(adventure.endDate || '');
  const [budget, setBudget] = useState(adventure.budget.toString());
  const [eventCategory, setEventCategory] = useState(adventure.eventCategory || '');
  const [otherEventCategory, setOtherEventCategory] = useState(''); // Simplified for edit
  const [destinations, setDestinations] = useState(adventure.destinations || []);
  const [endLocation, setEndLocation] = useState(adventure.endLocation || '');
  const [endCoordinates, setEndCoordinates] = useState(adventure.endCoordinates || null);

  const handleSubmit = () => {
    // Create a mutable copy of the adventure data
    const updatedData: any = {
      type: adventureType,
      privacy,
      title,
      description,
      location,
      startDate,
      budget: parseInt(budget, 10) || 0,
    };
    
    // Conditionally add optional fields ONLY if they have a value
    if (privacy === AdventurePrivacy.Twins) updatedData.subPrivacy = subPrivacy;
    if (coordinates) updatedData.coordinates = coordinates;
    if (endDate) updatedData.endDate = endDate; else updatedData.endDate = null;
    
    // Add type-specific data, again, only if valid
    switch (adventureType) {
        case AdventureType.Travel:
            const validDestinations = destinations.filter(d => d.location && d.coordinates);
            updatedData.destinations = validDestinations.length > 0 ? validDestinations : null;
            break;
        case AdventureType.Event:
            const finalCategory = eventCategory === 'Other' ? otherEventCategory : eventCategory;
            updatedData.eventCategory = finalCategory || null;
            break;
        case AdventureType.Hiking:
        case AdventureType.Cycling:
            updatedData.endLocation = endLocation || null;
            updatedData.endCoordinates = endCoordinates || null;
            break;
    }
    
    // Clean up null fields from other types
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    onUpdateAdventure(adventure.id, updatedData);
    onClose();
  };

  const handleAddDestination = () => {
    setDestinations([...destinations, { location: '', coordinates: { lat: 0, lng: 0 } }]);
  };
  
  const handleDestinationChange = (index: number, newLocation: string, newCoords: { lat: number; lng: number } | null) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], location: newLocation, ...(newCoords && { coordinates: newCoords }) };
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
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} />
            </div>

            <div>
              <label htmlFor="description" className={labelBaseClasses}>{t('description')}</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputBaseClasses}></textarea>
            </div>
            
            {renderDynamicFields()}
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