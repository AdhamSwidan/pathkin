import React from 'react';
import { AdventureType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface FilterBarProps {
  type: AdventureType | 'all';
  city: string;
  budget: string;
  startDate: string;
  endDate: string;
  onTypeChange: (value: AdventureType | 'all') => void;
  onCityChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  citySuggestions: google.maps.places.AutocompletePrediction[];
  isFetchingCity: boolean;
  onSelectCitySuggestion: (suggestion: google.maps.places.AutocompletePrediction) => void;
  locationRef: React.RefObject<HTMLDivElement>;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  type,
  city,
  budget,
  startDate,
  endDate,
  onTypeChange,
  onCityChange,
  onBudgetChange,
  onStartDateChange,
  onEndDateChange,
  citySuggestions,
  isFetchingCity,
  onSelectCitySuggestion,
  locationRef
}) => {
  const { t } = useTranslation();
  const inputBaseClasses = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:placeholder-gray-400";
  const labelBaseClasses = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
  
  return (
    <div className="bg-slate-50 dark:bg-neutral-900 p-2 space-y-3 border-b dark:border-neutral-800">
      {/* Filters */}
      <div className="space-y-2">
        <div>
            <label htmlFor="type-filter" className={labelBaseClasses}>{t('adventureType')}</label>
            <select 
              id="type-filter" 
              className={inputBaseClasses} 
              aria-label="Filter by adventure type"
              value={type}
              onChange={(e) => onTypeChange(e.target.value as AdventureType | 'all')}
            >
              <option value="all">{t('allTypes')}</option>
              <option value={AdventureType.Travel}>{t('AdventureType_Travel')}</option>
              <option value={AdventureType.Event}>{t('AdventureType_Event')}</option>
              <option value={AdventureType.Hiking}>{t('AdventureType_Hiking')}</option>
              <option value={AdventureType.Camping}>{t('AdventureType_Camping')}</option>
              <option value={AdventureType.Volunteering}>{t('AdventureType_Volunteering')}</option>
              <option value={AdventureType.Cycling}>{t('AdventureType_Cycling')}</option>
            </select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div ref={locationRef} className="relative">
            <label htmlFor="city-filter" className={labelBaseClasses}>{t('city')}</label>
            <input
              id="city-filter"
              type="text"
              placeholder="e.g., Lisbon"
              className={inputBaseClasses}
              aria-label="Filter by city"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              autoComplete="off"
            />
             {isFetchingCity && <div className="p-2 text-xs text-gray-500">{t('searching')}</div>}
              {citySuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {citySuggestions.map(s => (
                          <li key={s.place_id} onClick={() => onSelectCitySuggestion(s)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer">
                              {s.description}
                          </li>
                      ))}
                  </ul>
              )}
          </div>
          <div>
            <label htmlFor="budget-filter" className={labelBaseClasses}>{t('maxBudget')}</label>
            <input
              id="budget-filter"
              type="number"
              placeholder="$1000"
              className={inputBaseClasses}
              aria-label="Filter by max budget"
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="start-date" className={labelBaseClasses}>{t('from')}</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`}
            aria-label="Filter by start date"
          />
        </div>
        <div>
          <label htmlFor="end-date" className={labelBaseClasses}>{t('to')}</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={`${inputBaseClasses} text-gray-500 dark:text-gray-400`}
            aria-label="Filter by end date"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;