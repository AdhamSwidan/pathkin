import React, { useState, useMemo } from 'react';
import { User, AdventureType, HydratedAdventure } from '../types';
import Header from './Header';
import AdventureCard from './AdventureCard';
import FilterBar from './FilterBar';
import SearchIcon from './icons/SearchIcon';
import CakeIcon from './icons/CakeIcon';
import MapIcon from './icons/MapIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface SearchScreenProps {
  adventures: HydratedAdventure[];
  currentUser: User;
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
  isGuest: boolean;
  onViewLocationOnMap: (adventure: HydratedAdventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onEditAdventure: (adventure: HydratedAdventure) => void;
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
  currentUser,
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
  isGuest,
  onViewLocationOnMap,
  onDeleteAdventure,
  onEditAdventure,
}) => {
  // Input states
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState<AdventureType | 'all'>('all');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);
  const { t } = useTranslation();

  const handleSearch = () => {
    setAppliedFilters({
      query: searchQuery,
      type,
      city,
      budget,
      startDate,
      endDate,
    });
  };

  const filteredAdventures = useMemo(() => {
    if (!appliedFilters) {
      return []; // Don't show any adventures until a search is performed
    }
    
    return adventures.filter(adventure => {
      // Keyword filter
      const lowerQuery = appliedFilters.query.toLowerCase().trim();
      if (lowerQuery && !(
        adventure.title.toLowerCase().includes(lowerQuery) ||
        adventure.description.toLowerCase().includes(lowerQuery) ||
        adventure.location.toLowerCase().includes(lowerQuery)
      )) {
        return false;
      }

      // Type filter
      if (appliedFilters.type !== 'all' && adventure.type !== appliedFilters.type) {
        return false;
      }

      // City filter
      const lowerCity = appliedFilters.city.toLowerCase().trim();
      if (lowerCity && !adventure.location.toLowerCase().includes(lowerCity)) {
        return false;
      }
      
      // Budget filter
      const numBudget = parseInt(appliedFilters.budget, 10);
      if (!isNaN(numBudget) && adventure.budget > numBudget) {
        return false;
      }

      // Date range filter
      if (!appliedFilters.startDate && !appliedFilters.endDate) {
          // No date filter applied
      } else {
        const adventureStart = new Date(adventure.startDate);
        adventureStart.setUTCHours(0, 0, 0, 0);
        
        const adventureEnd = adventure.endDate ? new Date(adventure.endDate) : new Date(adventure.startDate);
        adventureEnd.setUTCHours(0, 0, 0, 0);
        
        const filterStart = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
        if(filterStart) filterStart.setUTCHours(0, 0, 0, 0);

        const filterEnd = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;
        if(filterEnd) filterEnd.setUTCHours(0, 0, 0, 0);

        if ((filterStart && isNaN(filterStart.getTime())) || (filterEnd && isNaN(filterEnd.getTime()))) {
            // Invalid date input, don't filter by date
        } else {
            if (filterStart && filterEnd) {
                if (!(adventureStart <= filterEnd && adventureEnd >= filterStart)) return false;
            } else if (filterStart) {
                if (!(adventureEnd >= filterStart)) return false;
            } else if (filterEnd) {
                if (!(adventureStart <= filterEnd)) return false;
            }
        }
      }

      return true; // if all filters pass
    });
  }, [adventures, appliedFilters]);
  
  const resultsHaveCoordinates = useMemo(() => {
    return filteredAdventures.some(p => !!p.coordinates);
  }, [filteredAdventures]);

  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  
  return (
    <>
      <Header title={t('search')} />
      <div className="p-2 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
         <div className="relative">
            <input
              type="text"
              placeholder={t('search') + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputBaseClasses} ps-10`}
              aria-label="Search adventures"
            />
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <FilterBar
          type={type}
          city={city}
          budget={budget}
          startDate={startDate}
          endDate={endDate}
          onTypeChange={setType}
          onCityChange={setCity}
          onBudgetChange={setBudget}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
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
        {appliedFilters !== null && filteredAdventures.length > 0 && filteredAdventures.map(adventure => (
          <AdventureCard
            key={adventure.id}
            adventure={adventure}
            currentUser={currentUser}
            isGuest={isGuest}
            onCommentClick={onSelectAdventure}
            onMessageClick={onSendMessage}
            onInterestToggle={onToggleInterest}
            onViewProfile={onViewProfile}
            onRepostToggle={onRepostToggle}
            onSaveToggle={onSaveToggle}
            onShareAdventure={onShareAdventure}
            onToggleCompleted={onToggleCompleted}
            onViewLocationOnMap={onViewLocationOnMap}
            onDeleteAdventure={onDeleteAdventure}
            onEditAdventure={onEditAdventure}
          />
        ))}
        {appliedFilters !== null && filteredAdventures.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('noAdventuresFound')}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchScreen;