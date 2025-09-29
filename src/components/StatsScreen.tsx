
import React, { useMemo } from 'react';
import { Post, PostType, User, ActivityStatus } from '../types';
import { getCountryFromLocation, getFlagUrl } from '../utils/countryUtils';
import HikingIcon from './icons/HikingIcon';
import TentIcon from './icons/TentIcon';
import BicycleIcon from './icons/BicycleIcon';
import PlaneIcon from './icons/PlaneIcon';
import HeartIcon from './icons/HeartIcon';
import MessageIcon from './icons/MessageIcon';
import HomeIcon from './icons/HomeIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface StatsScreenProps {
  user: User;
  allPosts: Post[];
}

const activityIcons: Record<PostType, React.ReactNode> = {
  [PostType.Hiking]: <HikingIcon />,
  [PostType.Camping]: <TentIcon />,
  [PostType.Cycling]: <BicycleIcon />,
  [PostType.Volunteering]: <HeartIcon />,
  [PostType.Event]: <MessageIcon />,
  [PostType.Travel]: <PlaneIcon />,
  [PostType.Housing]: <HomeIcon />,
};


const StatsScreen: React.FC<StatsScreenProps> = ({ user, allPosts }) => {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    // Only count activities that have been confirmed by the host
    const confirmedActivityPostIds = new Set(
        user.activityLog
            .filter(a => a.status === ActivityStatus.Confirmed)
            .map(a => a.postId)
    );

    const completed = allPosts.filter(post => confirmedActivityPostIds.has(post.id));
    
    const countries = new Set<string>();
    completed.forEach(post => {
      const country = getCountryFromLocation(post.location);
      if (country) {
        countries.add(country);
      }
    });

    const activityCounts = completed.reduce((acc, post) => {
      acc[post.type] = (acc[post.type] || 0) + 1;
      return acc;
    }, {} as Record<PostType, number>);

    return {
      totalCompleted: completed.length,
      countriesVisited: Array.from(countries).sort(),
      activityCounts,
    };
  }, [user, allPosts]);

  const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
  
  const ActivityCard: React.FC<{ type: PostType, count: number }> = ({ type, count }) => (
    <div className="bg-slate-100 dark:bg-neutral-800/50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <div className="text-orange-500 mb-1 w-6 h-6">{activityIcons[type]}</div>
        <p className="font-bold text-xl text-gray-800 dark:text-gray-100">{count}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t(`PostType_${type}`)}</p>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
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
              <ActivityCard key={type} type={type as PostType} count={count} />
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
