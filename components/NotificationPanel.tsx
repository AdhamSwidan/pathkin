

import React from 'react';
import { Notification, NotificationType } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import MessageIcon from './icons/MessageIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onConfirmAttendance: (notificationId: string, postId: string, attendeeId: string, didAttend: boolean) => void;
  onRateExperience: (postId: string) => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  switch (type) {
    case NotificationType.Interest:
      return <HeartIcon className="w-5 h-5 text-rose-500" />;
    case NotificationType.Comment:
      return <CommentIcon className="w-5 h-5 text-sky-500" />;
    case NotificationType.Message:
      return <MessageIcon className="w-5 h-5 text-orange-500" />;
    case NotificationType.AttendanceRequest:
      return <CheckCircleIcon className="w-5 h-5 text-amber-500" />;
    case NotificationType.AttendanceConfirmed:
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case NotificationType.RateExperience:
      return <StarIcon className="w-5 h-5 text-amber-400" />;
    default:
      return null;
  }
};

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
  // Simple time ago function for demonstration
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return <span>{Math.floor(interval)}y ago</span>;
  interval = seconds / 2592000;
  if (interval > 1) return <span>{Math.floor(interval)}mo ago</span>;
  interval = seconds / 86400;
  if (interval > 1) return <span>{Math.floor(interval)}d ago</span>;
  interval = seconds / 3600;
  if (interval > 1) return <span>{Math.floor(interval)}h ago</span>;
  interval = seconds / 60;
  if (interval > 1) return <span>{Math.floor(interval)}m ago</span>;
  return <span>{Math.floor(seconds)}s ago</span>;
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onConfirmAttendance, onRateExperience }) => {
  const { t } = useTranslation();
  
  const handleRateClick = (e: React.MouseEvent, postId?: string) => {
    e.stopPropagation();
    if (postId) {
      onRateExperience(postId);
      onClose();
    }
  };

  const NotificationItem: React.FC<{ notif: Notification }> = ({ notif }) => {
    const isClickable = notif.type === NotificationType.RateExperience;

    return (
      <li 
        onClick={(e) => isClickable && handleRateClick(e, notif.post?.id)}
        className={`p-3 flex items-start space-x-3 transition-colors ${!notif.read ? 'bg-orange-50 dark:bg-orange-900/20' : ''} ${isClickable ? 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer' : ''}`}
      >
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notif.type} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <img src={notif.user.avatarUrl} alt={notif.user.name} className="w-8 h-8 rounded-full" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold dark:text-gray-100">{notif.user.name}</span> {notif.text}
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1"><TimeAgo date={notif.createdAt} /></p>
          {notif.type === NotificationType.AttendanceRequest && notif.post && notif.attendeeId && (
            <div className="mt-2 flex items-center space-x-2">
              <button 
                onClick={() => onConfirmAttendance(notif.id, notif.post!.id, notif.attendeeId!, true)}
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full hover:bg-green-200"
              >
                {t('confirm')}
              </button>
              <button 
                onClick={() => onConfirmAttendance(notif.id, notif.post!.id, notif.attendeeId!, false)}
                className="text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full hover:bg-red-200"
              >
                {t('deny')}
              </button>
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="absolute top-0 start-0 end-0 z-50 p-2">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-800 max-h-96 overflow-y-auto">
        <div className="p-3 border-b dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('notifications')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-bold text-lg">&times;</button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">{t('noNewNotifications')}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
            {notifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;