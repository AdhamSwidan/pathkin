

import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import FacebookIcon from './icons/FacebookIcon';
import { useTranslation } from '../contexts/LanguageContext';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => void;
  onSignUp: (name: string, username: string, email: string, pass: string, birthday: string, gender: string) => void;
  onSocialLogin: (provider: 'google' | 'facebook') => {name: string, email: string};
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
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const inputClasses = "w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-gray-200";
  const buttonClasses = "w-full py-3 rounded-md font-semibold text-white transition-colors";
  const socialButtonClasses = "w-full flex items-center justify-center py-3 rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      if (!fullName || !username || !birthday || !gender) {
        alert("Please fill in all fields.");
        return;
      }
      onSignUp(fullName, username, email, password, birthday, gender);
    }
  };

  const handleSocialClick = (provider: 'google' | 'facebook') => {
    const socialData = onSocialLogin(provider);
    setFullName(socialData.name);
    setEmail(socialData.email);
    setIsLogin(false); // Switch to sign-up view with pre-filled data
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">{t('appName')}</h1>
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
            </>
          )}
          
          {isLogin && (
            <div className="text-end -mt-2">
                <button type="button" onClick={onForgotPassword} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                    {t('forgotPassword')}
                </button>
            </div>
          )}
          
          <button type="submit" className={`${buttonClasses} bg-orange-600 hover:bg-orange-700`}>
            {isLogin ? t('logIn') : t('createAccount')}
          </button>
        </form>

        <div className="mt-4 text-center">
             <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full py-3 rounded-md font-semibold text-orange-500 bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                {isLogin ? t('createNewAccount') : t('backToLogin')}
            </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 dark:bg-neutral-950 text-gray-500 dark:text-gray-400">{t('or')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleSocialClick('google')} className={socialButtonClasses}>
            <GoogleIcon className="w-6 h-6 mx-3" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('continueWithGoogle')}</span>
          </button>
          <button onClick={() => handleSocialClick('facebook')} className={socialButtonClasses}>
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