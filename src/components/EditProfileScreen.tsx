import React, { useState, useRef, useMemo, useEffect } from 'react';
import Header from './Header';
import { User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { countries } from '../data/countries';

interface EditProfileScreenProps {
  onBack: () => void;
  currentUser: User;
  onUpdateProfile: (updatedUser: Partial<User>, avatarFile?: File, coverFile?: File) => void;
}

const allInterests = [
  'Hiking', 'Photography', 'Music', 'Tech', 'Art', 'Backpacking', 'Yoga', 'Foodie', 'Blogging', 'Culture', 'History', 'Museums', 'Architecture', 'Surfing', 'Skiing', 'Reading', 'Movies', 'Gaming'
];

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack, currentUser, onUpdateProfile }) => {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [birthday, setBirthday] = useState(currentUser.birthday || '');
  const [country, setCountry] = useState(currentUser.country || '');
  
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(currentUser.coverUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [coverFile, setCoverFile] = useState<File | undefined>();

  const [selectedInterests, setSelectedInterests] = useState(new Set(currentUser.interests || []));
  
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
            setIsCountryDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => 
    countries.filter(c => 
        c.toLowerCase().includes(countrySearch.toLowerCase())
    ), 
    [countrySearch]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (type === 'avatar') {
          setAvatarPreview(url);
          setAvatarFile(file);
        } else {
          setCoverPreview(url);
          setCoverFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      return newSet;
    });
  };

  const handleSaveChanges = () => {
    const updatedData: Partial<User> = {
      name,
      username,
      bio,
      birthday,
      country,
      interests: Array.from(selectedInterests),
    };
    onUpdateProfile(updatedData, avatarFile, coverFile);
  };

  const inputClasses = "w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950">
      <Header title={t('editProfile')} onBack={onBack} />
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        
        {/* Photos */}
        <div>
          <label className={labelClasses}>Profile Pictures</label>
          <div className="relative h-32 rounded-lg bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700">
            <img src={coverPreview || `https://picsum.photos/seed/${currentUser.id}-cover/800/200`} className="w-full h-full object-cover rounded-lg" alt="Cover"/>
            <input type="file" accept="image/*" ref={coverFileRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" />
            <button onClick={() => coverFileRef.current?.click()} className="absolute top-2 end-2 bg-black/50 p-1 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <div className="absolute bottom-0 start-4 translate-y-1/2">
               <div className="relative w-24 h-24">
                 <img src={avatarPreview} className="w-full h-full rounded-full border-4 border-slate-50 dark:border-neutral-950" alt="Avatar"/>
                 <input type="file" accept="image/*" ref={avatarFileRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                 <button onClick={() => avatarFileRef.current?.click()} className="absolute bottom-1 end-1 bg-black/50 p-1 rounded-full text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                 </button>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-12 space-y-4">
          <div>
            <label htmlFor="name" className={labelClasses}>{t('fullName')}</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="username" className={labelClasses}>{t('username')}</label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="bio" className={labelClasses}>{t('description')}</label>
            <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className={inputClasses} rows={3}></textarea>
          </div>
          <div>
            <label htmlFor="birthday" className={labelClasses}>{t('birthday')}</label>
            <input id="birthday" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={`${inputClasses} text-gray-500 dark:text-gray-400`} />
          </div>
          <div ref={countryRef} className="relative">
              <label htmlFor="country" className={labelClasses}>{t('homeCountry')}</label>
              <button type="button" onClick={() => setIsCountryDropdownOpen(prev => !prev)} className={`${inputClasses} text-left ${country ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                {country || t('selectOption')}
              </button>
              {isCountryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <input 
                      type="text" 
                      placeholder={t('searchForCountry')}
                      className={inputClasses}
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <ul className="py-1">
                    {filteredCountries.map(c => (
                      <li key={c}
                        onClick={() => {
                          setCountry(c);
                          setIsCountryDropdownOpen(false);
                          setCountrySearch('');
                        }}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
        </div>

        <div>
          <label className={labelClasses}>Interests</label>
          <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md">
            {allInterests.map(interest => {
              const isSelected = selectedInterests.has(interest);
              return (
                <button 
                  key={interest} 
                  onClick={() => toggleInterest(interest)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <button onClick={handleSaveChanges} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 transition-colors">
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
};

export default EditProfileScreen;