import React, { useMemo } from 'react';
import { Adventure, AdventureType, User, ActivityStatus } from '../types';
import { getCountryFromLocation, getFlagUrl } from '../utils/countryUtils';
import HikingIcon from './icons/HikingIcon';
import TentIcon from './icons/TentIcon';
import BicycleIcon from './icons/BicycleIcon';
import PlaneIcon from './icons/PlaneIcon';
import HeartIcon from './icons/HeartIcon';
import GroupIcon from './icons/GroupIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface StatsScreenProps {
  user: User;
  allAdventures: Adventure[];
}

const activityIcons: Record<AdventureType, React.ReactNode> = {
  [AdventureType.Hiking]: <HikingIcon />,
  [AdventureType.Camping]: <TentIcon />,
  [AdventureType.Cycling]: <BicycleIcon />,
  [AdventureType.Volunteering]: <HeartIcon />,
  [AdventureType.Event]: <GroupIcon />,
  [AdventureType.Travel]: <PlaneIcon />,
};


const StatsScreen: React.FC<StatsScreenProps> = ({ user, allAdventures }) => {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    // Only count activities that have been confirmed by the host
    const confirmedActivityAdventureIds = new Set(
        (user.activityLog || [])
            .filter(a => a.status === ActivityStatus.Confirmed)
            .map(a => a.adventureId)
    );

    const completed = allAdventures.filter(adventure => confirmedActivityAdventureIds.has(adventure.id));
    
    const countries = new Set<string>();
    if (user.country) {
      countries.add(user.country);
    }
    
    completed.forEach(adventure => {
      const country = getCountryFromLocation(adventure.location);
      if (country) {
        countries.add(country);
      }
    });

    const activityCounts = completed.reduce((acc, adventure) => {
      acc[adventure.type] = (acc[adventure.type] || 0) + 1;
      return acc;
    }, {} as Record<AdventureType, number>);

    return {
      totalCompleted: completed.length,
      countriesVisited: Array.from(countries).sort(),
      activityCounts,
    };
  }, [user, allAdventures]);

  const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
  
  const ActivityCard: React.FC<{ type: AdventureType, count: number }> = ({ type, count }) => (
    <div className="bg-slate-100 dark:bg-neutral-800/50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <div className="text-orange-500 mb-1 w-6 h-6">{activityIcons[type]}</div>
        <p className="font-bold text-xl text-gray-800 dark:text-gray-100">{count}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t(`AdventureType_${type}`)}</p>
    </div>
  );

  const homeCountryFlagUrl = user.country ? getFlagUrl(user.country) : null;

  return (
    <div className="p-4 space-y-4">
      {user.country && (
        <StatCard title={t('homeCountry')}>
           <div className="flex items-center space-x-3">
              {homeCountryFlagUrl && (
                  <img src={homeCountryFlagUrl} alt={user.country} className="w-10 h-auto rounded-sm shadow-md" />
              )}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{user.country}</span>
           </div>
        </StatCard>
      )}

      <StatCard title={t('countriesVisited')}>
        {stats.countriesVisited.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {stats.countriesVisited.map(country => {
              const flagUrl = getFlagUrl(country);
              if (!flagUrl) return null;
              return (
                <img
                  key={country}
                  src={flagUrl}
                  alt={country}
                  title={country}
                  className="w-10 h-auto rounded-sm shadow-md object-cover"
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noCountries')}</p>
        )}
      </StatCard>
      
      <StatCard title={t('activityBreakdown')}>
        {Object.keys(stats.activityCounts).length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Object.entries(stats.activityCounts).map(([type, count]) => (
              <ActivityCard key={type} type={type as AdventureType} count={count} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noActivities')}</p>
        )}
      </StatCard>
    </div>
  );
};

export default StatsScreen;