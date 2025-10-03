import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { User, AdventureType, HydratedAdventure } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import FilterBar from './FilterBar';
import SearchIcon from './icons/SearchIcon';
import CakeIcon from './icons/CakeIcon';
import MapIcon from './icons/MapIcon';
import UsersIcon from './icons/UsersIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface SearchScreenProps {
  adventures: HydratedAdventure[];
  allUsers: User[];
  currentUser: User;
  isGuest: boolean;
  isLoaded: boolean;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
  onSendMessage: (user: User) => void;
  onToggleInterest: (adventureId: string) => void;
  onNavigateToFindTwins: () => void;
  onViewProfile: (user: User) => void;
  onShowResultsOnMap: (adventures: HydratedAdventure[]) => void;
  onRepostToggle: (adventureId: string) => void;
  onSaveToggle: (adventureId: string) => void;
  onShareAdventure: (adventure: HydratedAdventure) => void;
  onToggleCompleted: (adventureId: string) => void;
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
  onFollowToggle: (userId: string) => void;
}

interface AppliedFilters {
  query: string;
  type: AdventureType | 'all';
  city: string;
  budget: string;
  startDate: string;
  endDate: string;
}

const SearchScreen: React.FC<SearchScreenProps> = ({
  adventures,
  allUsers,
  currentUser,
  isGuest,
  isLoaded,
  onSelectAdventure,
  onSendMessage,
  onToggleInterest,
  onNavigateToFindTwins,
  onViewProfile,
  onShowResultsOnMap,
  onRepostToggle,
  onSaveToggle,
  onShareAdventure,
  onToggleCompleted,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
  onFollowToggle,
}) => {
  const [searchMode, setSearchMode] = useState<'adventures' | 'people'>('adventures');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState<AdventureType | 'all'>('all');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [locationSuggestions, setLocationSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState('');
  const locationRef = useRef<HTMLDivElement>(null);
  
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);
  const { t } = useTranslation();

  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (isLoaded && window.google) {
        setAutocompleteService(new window.google.maps.places.AutocompleteService());
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

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (city.trim() !== selectedCityName) {
        fetchLocations(city);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [city, selectedCityName, fetchLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
            setLocationSuggestions([]);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (suggestion: google.maps.places.AutocompletePrediction) => {
    setCity(suggestion.description); 
    setSelectedCityName(suggestion.description);
    setLocationSuggestions([]);
  };

  const handleSearch = () => {
    setAppliedFilters({ query: searchQuery, type, city, budget, startDate, endDate });
  };
  
  const filteredAdventures = useMemo(() => {
    if (searchMode !== 'adventures' || !appliedFilters) return [];
    
    return adventures.filter(adventure => {
      const lowerQuery = appliedFilters.query.toLowerCase().trim();
      if (lowerQuery && !(
        adventure.title.toLowerCase().includes(lowerQuery) ||
        adventure.description.toLowerCase().includes(lowerQuery) ||
        adventure.location.toLowerCase().includes(lowerQuery)
      )) return false;

      if (appliedFilters.type !== 'all' && adventure.type !== appliedFilters.type) return false;
      const lowerCity = appliedFilters.city.toLowerCase().trim();
      if (lowerCity && !adventure.location.toLowerCase().includes(lowerCity.split(',')[0])) return false;
      const numBudget = parseInt(appliedFilters.budget, 10);
      if (!isNaN(numBudget) && adventure.budget > numBudget) return false;

      if (appliedFilters.startDate || appliedFilters.endDate) {
        const adventureStart = new Date(adventure.startDate);
        const adventureEnd = adventure.endDate ? new Date(adventure.endDate) : adventureStart;
        const filterStart = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
        const filterEnd = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;
        if (filterStart && filterEnd) {
            if (!(adventureStart <= filterEnd && adventureEnd >= filterStart)) return false;
        } else if (filterStart) {
            if (!(adventureEnd >= filterStart)) return false;
        } else if (filterEnd) {
            if (!(adventureStart <= filterEnd)) return false;
        }
      }
      return true;
    });
  }, [adventures, appliedFilters, searchMode]);

  const filteredUsers = useMemo(() => {
    if (searchMode !== 'people' || !appliedFilters) return [];
    const lowerQuery = appliedFilters.query.toLowerCase().trim();
    if (!lowerQuery) return [];
    return allUsers.filter(user =>
        user.id !== currentUser.id && (
            user.name.toLowerCase().includes(lowerQuery) ||
            user.username.toLowerCase().includes(lowerQuery)
        )
    );
  }, [allUsers, currentUser.id, appliedFilters, searchMode]);
  
  const resultsHaveCoordinates = useMemo(() => filteredAdventures.some(p => !!p.coordinates), [filteredAdventures]);
  
  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const baseButtonClasses = "text-sm px-3 py-1 rounded-full font-semibold transition-colors";
  const primaryButtonClasses = "bg-orange-500 text-white hover:bg-orange-600";
  const secondaryButtonClasses = "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600";

  return (
    <>
      <Header title={t('search')} />
      <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
         <div className="relative">
            <input
              type="text"
              placeholder={searchMode === 'adventures' ? t('findNextAdventure') : t('searchPlaceholderPeople')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputBaseClasses} ps-10`}
              aria-label="Search"
            />
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="border-b dark:border-neutral-800 flex bg-slate-50 dark:bg-neutral-900">
        <TabButton id="adventures" label={t('adventures')} icon={<SearchIcon />} active={searchMode === 'adventures'} onClick={() => setSearchMode('adventures')} />
        <TabButton id="people" label={t('people')} icon={<UsersIcon />} active={searchMode === 'people'} onClick={() => setSearchMode('people')} />
      </div>
      
      {searchMode === 'adventures' && (
        <>
            <FilterBar
                type={type} city={city} budget={budget} startDate={startDate} endDate={endDate}
                onTypeChange={setType} onCityChange={setCity} onBudgetChange={setBudget}
                onStartDateChange={setStartDate} onEndDateChange={setEndDate}
                locationRef={locationRef}
                citySuggestions={locationSuggestions}
                isFetchingCity={isFetchingLocation}
                onSelectCitySuggestion={handleSelectLocation}
            />
            <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
                <button
                onClick={handleSearch}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors"
                >
                {t('search')}
                </button>
            </div>
            {appliedFilters && filteredAdventures.length > 0 && resultsHaveCoordinates && (
                <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
                    <button
                        onClick={() => onShowResultsOnMap(filteredAdventures)}
                        className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white font-semibold py-2 rounded-md hover:bg-sky-700 transition-colors"
                    >
                        <MapIcon className="w-5 h-5" />
                        <span>{t('showOnMap')}</span>
                    </button>
                </div>
            )}
        </>
      )}

      {searchMode === 'people' && (
        <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
            <button
            onClick={handleSearch}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors"
            >
            {t('search')}
            </button>
        </div>
      )}
      
      <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
        <button
          onClick={onNavigateToFindTwins}
          className="w-full flex items-center justify-center space-x-2 bg-neutral-800 border border-neutral-700 text-gray-200 font-semibold py-2 rounded-md hover:bg-neutral-700 transition-colors"
        >
          <CakeIcon className="w-5 h-5 text-rose-500" />
          <span>{t('findYourTwins')}</span>
        </button>
      </div>
      
      <div className="px-2 pt-2 flex-grow overflow-y-auto">
        {appliedFilters === null && (
          <div className="text-center py-10 px-4">
            <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('findNextAdventure')}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{t('useFiltersPrompt')}</p>
          </div>
        )}

        {searchMode === 'adventures' && appliedFilters && (
            <>
                {filteredAdventures.length > 0 ? filteredAdventures.map(adventure => (
                    <AdventureCard key={adventure.id} adventure={adventure} currentUser={currentUser} isGuest={isGuest}
                        onCommentClick={onSelectAdventure} onMessageClick={onSendMessage} onInterestToggle={onToggleInterest}
                        onViewProfile={onViewProfile} onRepostToggle={onRepostToggle} onSaveToggle={onSaveToggle}
                        onShareAdventure={onShareAdventure} onToggleCompleted={onToggleCompleted} onViewLocationOnMap={onViewLocationOnMap}
                        onDeleteAdventure={onDeleteAdventure} onEditAdventure={onEditAdventure}
                    />
                )) : (
                    <div className="text-center py-10 px-4">
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('noAdventuresFound')}</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{t('tryAdjustingFilters')}</p>
                    </div>
                )}
            </>
        )}
        
        {searchMode === 'people' && appliedFilters && (
            <div className="space-y-3">
                {filteredUsers.length > 0 ? filteredUsers.map(user => {
                    const isFollowing = (currentUser.following || []).includes(user.id);
                    return (
                      <div key={user.id} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <button onClick={() => onViewProfile(user)} className="flex items-center mb-2 sm:mb-0 text-left">
                          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full me-4" />
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                          </div>
                        </button>
                        <div className="flex space-x-2 justify-end">
                          <button onClick={() => onFollowToggle(user.id)} className={`${baseButtonClasses} ${isFollowing ? secondaryButtonClasses : primaryButtonClasses}`} disabled={isGuest}>
                            {isFollowing ? t('following') : t('follow')}
                          </button>
                          <button onClick={() => onSendMessage(user)} className={`${baseButtonClasses} ${secondaryButtonClasses}`} disabled={isGuest}>
                            {t('message')}
                          </button>
                        </div>
                      </div>
                    )
                }) : (
                    <div className="text-center py-10 px-4">
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('noUsersFound')}</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{t('tryDifferentSearch')}</p>
                    </div>
                )}
            </div>
        )}

      </div>
    </>
  );
};

const TabButton: React.FC<{id: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void}> = ({id, label, icon, active, onClick}) => (
    <button
        id={id}
        onClick={onClick}
        className={`flex-1 flex items-center justify-center py-3 text-sm font-semibold border-b-2 transition-colors ${
            active
            ? 'border-orange-500 text-orange-500'
            : 'border-transparent text-gray-500 hover:text-orange-500'
        }`}
        >
        <span className="w-5 h-5 me-2">{icon}</span>
        {label}
    </button>
);


export default SearchScreen;