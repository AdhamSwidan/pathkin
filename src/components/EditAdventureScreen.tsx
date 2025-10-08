
// Fix: Import `useRef` from React to resolve "Cannot find name 'useRef'" error.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Adventure, AdventurePrivacy, AdventureType, HydratedAdventure } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import LocationPickerModal from './LocationPickerModal';
import { StandaloneSearchBox } from '@react-google-maps/api';
import MapPinIcon from './icons/MapPinIcon';
import Header from './Header';


interface EditAdventureScreenProps {
  adventure: HydratedAdventure;
  onBack: () => void;
  onUpdateAdventure: (adventureId: string, updatedData: Partial<Adventure>) => void;
  isLoaded: boolean;
}

const LocationInputWithAutocomplete: React.FC<{
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    onCoordsChange: (coords: { lat: number, lng: number } | null) => void;
    onOpenMap: () => void;
    isLoaded: boolean;
}> = ({ label, value, onValueChange, onCoordsChange, onOpenMap, isLoaded }) => {
    const { t } = useTranslation();
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    }, []);

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            const newLocationName = place.formatted_address || place.name || '';
            onValueChange(newLocationName);
            if (place.geometry?.location) {
                onCoordsChange({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            }
        }
    };
    
    const [inputValue, setInputValue] = useState(value);
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</label>
            <div className="flex items-center space-x-2 mt-2">
                <div className="relative flex-grow">
                    {isLoaded ? (
                        <StandaloneSearchBox
                            onLoad={onSearchBoxLoad}
                            onPlacesChanged={onPlacesChanged}
                        >
                            <input
                                type="text"
                                placeholder={t('searchForLocation')}
                                value={inputValue}
                                onChange={e => {
                                    setInputValue(e.target.value);
                                    onValueChange(e.target.value);
                                }}
                                className="w-full text-left p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800"
                            />
                        </StandaloneSearchBox>
                    ) : (
                        <input type="text" value={t('loading')} className="w-full p-2 border rounded-lg bg-slate-200" disabled />
                    )}
                </div>
                <button
                    onClick={onOpenMap}
                    className="p-2.5 bg-gray-200 dark:bg-zinc-700 rounded-lg"
                    aria-label={t('selectOnMap')}
                >
                    <MapPinIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


const EditAdventureScreen: React.FC<EditAdventureScreenProps> = ({ adventure, onBack, onUpdateAdventure, isLoaded }) => {
  const { t } = useTranslation();

  const getLocalTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
  };
  
  // Common State
  const [adventureType, setAdventureType] = useState<AdventureType>(adventure.type);
  const [privacy, setPrivacy] = useState<AdventurePrivacy>(adventure.privacy);
  const [subPrivacy, setSubPrivacy] = useState(adventure.subPrivacy || AdventurePrivacy.Public);
  const [title, setTitle] = useState(adventure.title);
  const [description, setDescription] = useState(adventure.description);
  
  // Dynamic State
  const [location, setLocation] = useState(adventure.location);
  const [coordinates, setCoordinates] = useState(adventure.coordinates || null);
  const [startDate, setStartDate] = useState(adventure.startDate.split('T')[0]); // Format for date input
  const [endDate, setEndDate] = useState(adventure.endDate?.split('T')[0] || '');
  const [startTime, setStartTime] = useState(getLocalTime(adventure.startDate));
  const [endTime, setEndTime] = useState(getLocalTime(adventure.endDate));
  const [budget, setBudget] = useState(adventure.budget.toString());
  
  // Type-specific state
  const [eventCategory, setEventCategory] = useState(adventure.eventCategory || '');
  const [otherEventCategory, setOtherEventCategory] = useState(''); // Simplified for now
  const [destinations, setDestinations] = useState(adventure.destinations || []);
  const [endLocation, setEndLocation] = useState(adventure.endLocation || '');
  const [endCoordinates, setEndCoordinates] = useState(adventure.endCoordinates || null);
  
  // Location Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'point' | 'route'>('point');
  const [editingLocationFor, setEditingLocationFor] = useState<string>('location');

  useEffect(() => {
    if (adventure.eventCategory && !['Music', 'Art', 'Food', 'Sports', 'Tech', 'Community'].includes(adventure.eventCategory)) {
        setEventCategory('Other');
        setOtherEventCategory(adventure.eventCategory);
    }
  }, [adventure.eventCategory]);

  const handleSubmit = () => {
    const finalStartDate = new Date(`${startDate}${startTime ? 'T' + startTime : ''}`).toISOString();

    const updatedData: { [key: string]: any } = {
      type: adventureType,
      privacy,
      title,
      description,
      location,
      coordinates: coordinates || null,
      startDate: finalStartDate,
      budget: parseInt(budget, 10) || 0,
    };
    
    if (endDate) {
        const finalEndDate = new Date(`${endDate}${endTime ? 'T' + endTime : ''}`).toISOString();
        updatedData.endDate = finalEndDate;
    } else {
        updatedData.endDate = null;
    }

    if (privacy === AdventurePrivacy.Twins) {
      updatedData.subPrivacy = subPrivacy;
    } else {
      updatedData.subPrivacy = null;
    }

    updatedData.destinations = null;
    updatedData.eventCategory = null;
    updatedData.endLocation = null;
    updatedData.endCoordinates = null;

    switch (adventureType) {
      case AdventureType.Travel:
        updatedData.destinations = destinations.filter(d => d.location);
        break;
      case AdventureType.Event:
        updatedData.eventCategory = eventCategory === 'Other' ? otherEventCategory : eventCategory;
        break;
      case AdventureType.Hiking:
      case AdventureType.Cycling:
        updatedData.endLocation = endLocation || null;
        updatedData.endCoordinates = endCoordinates || null;
        break;
    }

    onUpdateAdventure(adventure.id, updatedData as Partial<Adventure>);
  };
  
  const openLocationPicker = (fieldIdentifier: string, mode: 'point' | 'route' = 'point') => {
    setEditingLocationFor(fieldIdentifier);
    setPickerMode(mode);
    setIsPickerOpen(true);
  };
  
  const handleLocationSelect = (address: string, coords: { lat: number; lng: number; }) => {
    if (editingLocationFor === 'location') { setLocation(address); setCoordinates(coords); }
    else if (editingLocationFor === 'startPoint') { setLocation(address); setCoordinates(coords); }
    else if (editingLocationFor === 'endPoint') { setEndLocation(address); setEndCoordinates(coords); }
    else if (editingLocationFor.startsWith('destination_')) {
      const index = parseInt(editingLocationFor.split('_')[1], 10);
      const newDests = [...destinations];
      newDests[index] = { location: address, coordinates: coords };
      setDestinations(newDests);
    }
    setIsPickerOpen(false);
  };

  const handleRouteSelect = (start: { address: string; coords: { lat: number; lng: number; } }, end: { address: string; coords: { lat: number; lng: number; } }) => {
    setLocation(start.address);
    setCoordinates(start.coords);
    setEndLocation(end.address);
    setEndCoordinates(end.coords);
    setIsPickerOpen(false);
  };

  const handleAddDestination = () => setDestinations([...destinations, { location: '', coordinates: { lat: 0, lng: 0 } }]);

  const adventureTypes = Object.values(AdventureType);
  const inputBaseClasses = "w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 focus:ring-brand-orange focus:border-brand-orange";
  const labelBaseClasses = "block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1";
  const tagButtonClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  
  const renderDynamicFields = () => {
     switch(adventureType) {
        case AdventureType.Travel:
            return (
              <div className="space-y-4">
                <LocationInputWithAutocomplete label={t('fromLocation')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onOpenMap={() => openLocationPicker('startPoint')} isLoaded={isLoaded} />
                {destinations.map((dest, index) => (
                  <div key={index}>
                    <LocationInputWithAutocomplete 
                      label={`${t('yourDestination')} #${index + 1}`} 
                      value={dest.location}
                      onValueChange={(val) => {
                        const newDests = [...destinations];
                        newDests[index].location = val;
                        setDestinations(newDests);
                      }}
                      onCoordsChange={(coords) => {
                        const newDests = [...destinations];
                        newDests[index].coordinates = coords!;
                        setDestinations(newDests);
                      }}
                      onOpenMap={() => openLocationPicker(`destination_${index}`)}
                      isLoaded={isLoaded}
                    />
                  </div>
                ))}
                <button onClick={handleAddDestination} className="text-sm font-semibold text-brand-orange hover:text-brand-orange-light">{t('addDestination')}</button>
              </div>
            );
        case AdventureType.Hiking:
        case AdventureType.Cycling:
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <p className="font-semibold">{t('startPoint')}: <span className="font-normal text-gray-600 dark:text-gray-300">{location || 'Not set'}</span></p>
                        <p className="font-semibold">{t('endPoint')}: <span className="font-normal text-gray-600 dark:text-gray-300">{endLocation || 'Not set'}</span></p>
                    </div>
                    <button onClick={() => openLocationPicker('route', 'route')} className="w-full text-center p-2 border border-dashed border-gray-400 dark:border-zinc-600 rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800">
                      {t('drawRouteOnMap')}
                    </button>
                </div>
            );
        case AdventureType.Event:
            return (
                <div className="space-y-4">
                    <LocationInputWithAutocomplete label={t('location')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onOpenMap={() => openLocationPicker('location')} isLoaded={isLoaded} />
                    <div>
                        <label className={labelBaseClasses}>{t('eventCategory')}</label>
                        <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} className={`${inputBaseClasses} mt-2`}>
                            <option value="">{t('selectCategory')}</option>
                            <option value="Music">{t('categoryMusic')}</option>
                            <option value="Art">{t('categoryArt')}</option>
                            <option value="Food">{t('categoryFood')}</option>
                            <option value="Sports">{t('categorySports')}</option>
                            <option value="Tech">{t('categoryTech')}</option>
                            <option value="Community">{t('categoryCommunity')}</option>
                            <option value="Other">{t('categoryOther')}</option>
                        </select>
                    </div>
                    {eventCategory === 'Other' && (
                        <div>
                            <label className={labelBaseClasses}>{t('otherCategory')}</label>
                            <input type="text" value={otherEventCategory} onChange={e => setOtherEventCategory(e.target.value)} className={`${inputBaseClasses} mt-2`} />
                        </div>
                    )}
                </div>
            );
        default: // Camping, Volunteering
            return <LocationInputWithAutocomplete label={t('location')} value={location} onValueChange={setLocation} onCoordsChange={setCoordinates} onOpenMap={() => openLocationPicker('location')} isLoaded={isLoaded} />;
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
        <Header title={t('editAdventure')} onBack={onBack} />
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            <div>
                <label className={labelBaseClasses}>{t('title')}</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} />
            </div>
            <div>
                <label className={labelBaseClasses}>{t('description')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputBaseClasses}></textarea>
            </div>
            <div>
              <label className={labelBaseClasses}>{t('adventureType')}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {adventureTypes.map(type => (
                  <button key={type} onClick={() => setAdventureType(type)} className={`${tagButtonClasses} ${adventureType === type ? 'bg-brand-orange text-white' : 'bg-slate-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}>
                    {t(`AdventureType_${type}`)}
                  </button>
                ))}
              </div>
            </div>
            
            {renderDynamicFields()}
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelBaseClasses}>{t('startDate')}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/>
                </div>
                <div>
                    <label className={labelBaseClasses}>{t('startTime')}</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/>
                </div>
                <div>
                    <label className={labelBaseClasses}>{t('endDate')}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/>
                </div>
                <div>
                    <label className={labelBaseClasses}>{t('endTime')}</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={`${inputBaseClasses} text-gray-500`}/>
                </div>
            </div>
            <div><label className={labelBaseClasses}>{t('budget')}</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className={inputBaseClasses}/></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelBaseClasses}>{t('privacy')}</label>
                <select value={privacy} onChange={e => setPrivacy(e.target.value as AdventurePrivacy)} className={inputBaseClasses}>
                  <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                  <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                  <option value={AdventurePrivacy.Twins}>{t('AdventurePrivacy_Twins')}</option>
                </select>
              </div>
               {privacy === AdventurePrivacy.Twins && (
                <div>
                  <label className={labelBaseClasses}>{t('subPrivacyLabel')}</label>
                  <select value={subPrivacy} onChange={e => setSubPrivacy(e.target.value as AdventurePrivacy.Public | AdventurePrivacy.Followers)} className={inputBaseClasses}>
                      <option value={AdventurePrivacy.Public}>{t('AdventurePrivacy_Public')}</option>
                      <option value={AdventurePrivacy.Followers}>{t('AdventurePrivacy_Followers')}</option>
                  </select>
                </div>
               )}
            </div>
        </div>
        
        <div className="p-4 border-t dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
            <button onClick={handleSubmit} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
            {t('saveChanges')}
            </button>
        </div>
      </div>
      {isLoaded && <LocationPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onLocationSelect={handleLocationSelect}
        onRouteSelect={handleRouteSelect}
        mode={pickerMode}
        />}
    </>
  );
};

export default EditAdventureScreen;
