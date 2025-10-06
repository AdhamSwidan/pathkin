import React from 'react';
import { AdventureType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import GridIcon from './icons/GridIcon';
import PlaneIcon from './icons/PlaneIcon';
import GroupIcon from './icons/GroupIcon';
import HikingIcon from './icons/HikingIcon';
import TentIcon from './icons/TentIcon';
import HeartIcon from './icons/HeartIcon';
import BicycleIcon from './icons/BicycleIcon';

interface AdventureTypeFilterBarProps {
  selectedType: AdventureType | 'all';
  onSelectType: (type: AdventureType | 'all') => void;
}

const filterOptions: { type: AdventureType | 'all', icon: React.ReactNode, labelKey: string }[] = [
    { type: 'all', icon: <GridIcon />, labelKey: 'allTypes' },
    { type: AdventureType.Travel, icon: <PlaneIcon />, labelKey: `AdventureType_${AdventureType.Travel}` },
    { type: AdventureType.Event, icon: <GroupIcon />, labelKey: `AdventureType_${AdventureType.Event}` },
    { type: AdventureType.Hiking, icon: <HikingIcon />, labelKey: `AdventureType_${AdventureType.Hiking}` },
    { type: AdventureType.Camping, icon: <TentIcon />, labelKey: `AdventureType_${AdventureType.Camping}` },
    { type: AdventureType.Volunteering, icon: <HeartIcon />, labelKey: `AdventureType_${AdventureType.Volunteering}` },
    { type: AdventureType.Cycling, icon: <BicycleIcon />, labelKey: `AdventureType_${AdventureType.Cycling}` },
];

const AdventureTypeFilterBar: React.FC<AdventureTypeFilterBarProps> = ({ selectedType, onSelectType }) => {
    const { t } = useTranslation();

    return (
        <div className="px-2">
            <div className="grid grid-cols-4 gap-2">
                {filterOptions.map(option => {
                    const isActive = selectedType === option.type;
                    return (
                        <button
                            key={option.type}
                            onClick={() => onSelectType(option.type)}
                            className={`flex flex-col items-center justify-center p-2 h-20 rounded-2xl transition-colors duration-200 ${
                                isActive 
                                ? 'bg-brand-orange/10 dark:bg-brand-orange/20' 
                                : 'bg-slate-100 dark:bg-dark-bg-secondary hover:bg-slate-200 dark:hover:bg-zinc-700/50'
                            }`}
                        >
                            <div className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400'}`}>
                                {option.icon}
                            </div>
                            <span className={`text-[11px] mt-1.5 text-center font-medium ${isActive ? 'text-brand-orange dark:text-brand-orange-light' : 'text-gray-600 dark:text-gray-300'}`}>
                                {t(option.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AdventureTypeFilterBar;