

import React, { useState } from 'react';
import { User } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface FindTwinsScreenProps {
  currentUser: User;
  allUsers: User[];
  onSendMessage: (user: User) => void;
  onBack: () => void;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (user: User) => void;
}

type SearchType = 'exact' | 'dayAndMonth';

const FindTwinsScreen: React.FC<FindTwinsScreenProps> = ({ 
  currentUser, 
  allUsers, 
  onSendMessage, 
  onBack,
  onFollowToggle,
  onViewProfile
}) => {
  const [searchType, setSearchType] = useState<SearchType>('exact');
  const [results, setResults] = useState<User[] | null>(null);
  const { t } = useTranslation();

  const handleSearch = () => {
    if (!currentUser.birthday) {
      alert("You don't have a birthday set in your profile.");
      return;
    }

    const matchingUsers = allUsers.filter(user => {
      if (user.id === currentUser.id || !user.birthday || !user.privacySettings.allowTwinSearch) {
        return false;
      }
      if (searchType === 'exact') {
        return user.birthday === currentUser.birthday;
      }
      return user.birthday.substring(5) === currentUser.birthday?.substring(5);
    });
    setResults(matchingUsers);
  };

  const baseButtonClasses = "text-sm px-3 py-1 rounded-full font-semibold transition-colors";
  const primaryButtonClasses = "bg-orange-500 text-white hover:bg-orange-600";
  const secondaryButtonClasses = "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600";


  return (
    <>
      <Header title={t('findYourTwins')} onBack={onBack} />
      <div className="p-4 space-y-4">
        {/* Search controls */}
        <div className="bg-gray-100 dark:bg-neutral-900 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{t('searchForPeople')}</p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="exact"
                checked={searchType === 'exact'}
                onChange={() => setSearchType('exact')}
                className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <span className="ms-2 text-sm text-gray-700 dark:text-gray-300">{t('sameExactBirthday')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="dayAndMonth"
                checked={searchType === 'dayAndMonth'}
                onChange={() => setSearchType('dayAndMonth')}
                className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <span className="ms-2 text-sm text-gray-700 dark:text-gray-300">{t('sameDayMonth')}</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors"
        >
          {t('findYourTwins')}
        </button>

        {/* Results */}
        <div className="mt-6">
          {results === null && <p className="text-center text-gray-500 dark:text-gray-400">{t('pressToFindTwins')}</p>}
          {results !== null && results.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">{t('noTwinsFound')}</p>}
          {results !== null && results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg dark:text-white">{t('foundTwins', { count: results.length })}</h3>
              {results.map(user => {
                const isFollowing = currentUser.following.includes(user.id);
                return (
                  <div key={user.id} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <button onClick={() => onViewProfile(user)} className="flex items-center mb-2 sm:mb-0 text-left">
                      <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full me-4" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.bio}</p>
                      </div>
                    </button>
                    <div className="flex space-x-2 justify-end">
                      <button 
                        onClick={() => onFollowToggle(user.id)} 
                        className={`${baseButtonClasses} ${isFollowing ? secondaryButtonClasses : primaryButtonClasses}`}
                      >
                        {isFollowing ? t('following') : t('follow')}
                      </button>
                      <button 
                        onClick={() => onSendMessage(user)} 
                        className={`${baseButtonClasses} ${secondaryButtonClasses}`}
                      >
                        {t('message')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FindTwinsScreen;