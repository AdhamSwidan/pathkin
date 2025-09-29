
import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import SendIcon from './icons/SendIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to allow for closing animation
    setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[101] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm flex flex-col p-6 text-center relative">
        <button onClick={handleClose} className="absolute top-2 end-2 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        
        {!isSubmitted ? (
            <>
                <h2 className="text-xl font-bold dark:text-white mb-2">{t('resetPassword')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('resetPasswordPrompt')}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder={t('emailAddress')} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-gray-200" 
                        required 
                    />
                    <button 
                        type="submit" 
                        className="w-full py-3 rounded-md font-semibold text-white transition-colors bg-orange-600 hover:bg-orange-700 flex items-center justify-center space-x-2"
                    >
                        <SendIcon className="w-5 h-5" />
                        <span>{t('sendResetLink')}</span>
                    </button>
                </form>
            </>
        ) : (
            <>
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold dark:text-white mb-2">{t('passwordResetSentTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('passwordResetSent')}</p>
            </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
