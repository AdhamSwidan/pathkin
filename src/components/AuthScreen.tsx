import React, { useState, useMemo, useRef, useEffect } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import FacebookIcon from './icons/FacebookIcon';
import { useTranslation } from '../contexts/LanguageContext';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import { countries } from '../data/countries';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => void;
  onSignUp: (name: string, username: string, email: string, pass: string, birthday: string, gender: string, country: string) => void;
  onSocialLogin: (provider: 'google' | 'facebook') => void;
  onGuestLogin: () => void;
  onForgotPassword: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignUp, onSocialLogin, onGuestLogin, onForgotPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  
  const { t } = useTranslation();

  const inputClasses = "w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-dark-bg-secondary border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white dark:focus:bg-zinc-900 text-gray-800 dark:text-gray-200 transition-colors";
  const buttonClasses = "w-full py-3 rounded-lg font-semibold text-white transition-colors";
  const socialButtonClasses = "w-full flex items-center justify-center py-3 rounded-lg bg-slate-100 dark:bg-dark-bg-secondary hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      if (!fullName || !username || !birthday || !gender || !country) {
        alert("Please fill in all fields.");
        return;
      }
      onSignUp(fullName, username, email, password, birthday, gender, country);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-orange">{t('appName')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? t('welcomeBack') : t('joinCommunity')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder={t('fullName')} className={inputClasses} value={fullName} onChange={e => setFullName(e.target.value)} required />
              <input type="text" placeholder={t('username')} className={inputClasses} value={username} onChange={e => setUsername(e.target.value)} required />
            </>
          )}
          <input type="email" placeholder={t('emailAddress')} className={inputClasses} value={email} onChange={e => setEmail(e.target.value)} required />
           <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder={t('password')} 
              className={inputClasses} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 end-0 flex items-center px-4 text-gray-500 dark:text-gray-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          
          {!isLogin && (
            <>
              <div>
                <label htmlFor="birthday" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ms-1">{t('birthday')}</label>
                <input id="birthday" type="date" className={`${inputClasses} text-gray-500`} value={birthday} onChange={e => setBirthday(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gender" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ms-1">{t('gender')}</label>
                  <select id="gender" className={`${inputClasses} text-gray-500`} value={gender} onChange={e => setGender(e.target.value)} required>
                    <option value="" disabled>{t('selectOption')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                    <option value="prefer_not_to_say">{t('preferNotToSay')}</option>
                  </select>
                </div>
                <div ref={countryRef} className="relative">
                  <label htmlFor="country" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ms-1">{t('country')}</label>
                  <button type="button" onClick={() => setIsCountryDropdownOpen(prev => !prev)} className={`${inputClasses} text-left ${country ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                    {country || t('selectOption')}
                  </button>
                  {isCountryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-bg-secondary border dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {isLogin && (
            <div className="text-end -mt-2">
                <button type="button" onClick={onForgotPassword} className="text-sm font-semibold text-brand-orange hover:text-brand-orange-light">
                    {t('forgotPassword')}
                </button>
            </div>
          )}
          
          <button type="submit" className={`${buttonClasses} bg-brand-orange hover:bg-brand-orange-light`}>
            {isLogin ? t('logIn') : t('createAccount')}
          </button>
        </form>

        <div className="mt-4 text-center">
             <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full py-3 rounded-lg font-semibold text-brand-orange bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                {isLogin ? t('createNewAccount') : t('backToLogin')}
            </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-light-bg dark:bg-dark-bg text-gray-500 dark:text-gray-400">{t('or')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => onSocialLogin('google')} className={socialButtonClasses}>
            <GoogleIcon className="w-6 h-6 mx-3" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('continueWithGoogle')}</span>
          </button>
          <button onClick={() => onSocialLogin('facebook')} className={socialButtonClasses}>
            <FacebookIcon className="w-6 h-6 mx-3" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('continueWithFacebook')}</span>
          </button>
           <button onClick={onGuestLogin} className={`${socialButtonClasses} text-gray-700 dark:text-gray-300 font-semibold`}>
            {t('continueAsGuest')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;