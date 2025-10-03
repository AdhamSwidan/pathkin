import React, { useEffect, useMemo } from 'react';
import { HydratedNotification, NotificationType } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import MessageIcon from './icons/MessageIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import StarIcon from './icons/StarIcon';

interface NotificationsScreenProps {
  notifications: HydratedNotification[];
  onBack: () => void;
  onConfirmAttendance: (notificationId: string, adventureId: string, attendeeId: string, didAttend: boolean) => void;
  onNotificationClick: (notification: HydratedNotification) => void;
  onMarkAllAsRead: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const commonClasses = "w-6 h-6";
  switch (type) {
    case NotificationType.Interest:
      return <div className="bg-rose-100 dark:bg-rose-900/50 p-1.5 rounded-full"><HeartIcon className={`${commonClasses} text-rose-500`} /></div>;
    case NotificationType.Comment:
      return <div className="bg-sky-100 dark:bg-sky-900/50 p-1.5 rounded-full"><CommentIcon className={`${commonClasses} text-sky-500`} /></div>;
    case NotificationType.Message:
      return <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 rounded-full"><MessageIcon className={`${commonClasses} text-orange-500`} /></div>;
    case NotificationType.AttendanceRequest:
      return <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-full"><CheckCircleIcon className={`${commonClasses} text-amber-500`} /></div>;
    case NotificationType.AttendanceConfirmed:
      return <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full"><CheckCircleIcon className={`${commonClasses} text-green-500`} /></div>;
    case NotificationType.RateExperience:
      return <div className="bg-yellow-100 dark:bg-yellow-900/50 p-1.5 rounded-full"><StarIcon className={`${commonClasses} text-yellow-400`} /></div>;
    default:
      return null;
  }
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ notifications, onBack, onConfirmAttendance, onNotificationClick, onMarkAllAsRead }) => {
    const { t } = useTranslation();

    useEffect(() => {
        // Mark notifications as read when the screen is viewed
        onMarkAllAsRead();
    }, [onMarkAllAsRead]);

    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: HydratedNotification[] } = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        notifications.forEach(notif => {
            const notifDate = new Date(notif.createdAt);
            if (notifDate >= today) {
                groups.today.push(notif);
            } else if (notifDate >= yesterday) {
                groups.yesterday.push(notif);
            } else if (notifDate >= startOfWeek) {
                groups.thisWeek.push(notif);
            } else {
                groups.older.push(notif);
            }
        });
        return groups;
    }, [notifications]);
    
    const hasUnread = notifications.some(n => !n.read);

    const headerActions = (
      <button 
        onClick={onMarkAllAsRead}
        disabled={!hasUnread}
        className="text-sm font-semibold text-orange-600 dark:text-orange-400 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
      >
        {t('notifications.markAllAsRead')}
      </button>
    );

    const NotificationGroup: React.FC<{ title: string; items: HydratedNotification[] }> = ({ title, items }) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h2>
                <div className="bg-white dark:bg-neutral-900">
                    {items.map((notif, index) => (
                        <div key={notif.id} className={`${index > 0 ? 'border-t border-gray-100 dark:border-neutral-800' : ''}`}>
                             <NotificationItem notif={notif} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const NotificationItem: React.FC<{ notif: HydratedNotification }> = ({ notif }) => (
        <button onClick={() => onNotificationClick(notif)} className="w-full text-left p-4 flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
            {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>}
            <div className={`flex-shrink-0 ${notif.read ? 'ms-2' : ''}`}><NotificationIcon type={notif.type} /></div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <img src={notif.user.avatarUrl} alt={notif.user.name} className="w-8 h-8 rounded-full inline-block me-2" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 inline">
                            <span className="font-semibold dark:text-gray-100">{notif.user.name}</span> {notif.text}
                        </p>
                    </div>
                     {notif.adventure?.media?.[0]?.url && (
                        <img src={notif.adventure.media[0].url} className="w-12 h-12 rounded-md object-cover ms-2 flex-shrink-0" />
                    )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                {notif.type === NotificationType.AttendanceRequest && notif.adventureId && notif.attendeeId && (
                    <div className="mt-3 flex items-center space-x-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onConfirmAttendance(notif.id, notif.adventureId!, notif.attendeeId!, true); }}
                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1.5 rounded-full hover:bg-green-200 font-semibold"
                        >
                            {t('confirm')}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onConfirmAttendance(notif.id, notif.adventureId!, notif.attendeeId!, false); }}
                            className="text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-3 py-1.5 rounded-full hover:bg-red-200 font-semibold"
                        >
                            {t('deny')}
                        </button>
                    </div>
                )}
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-neutral-950">
            <Header title={t('notifications')} onBack={onBack} rightAction={headerActions} />
            <div className="flex-grow overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">{t('noNewNotifications')}</p>
                ) : (
                    <div className="space-y-4 pb-4">
                        <NotificationGroup title={t('notifications.today')} items={groupedNotifications.today} />
                        <NotificationGroup title={t('notifications.yesterday')} items={groupedNotifications.yesterday} />
                        <NotificationGroup title={t('notifications.thisWeek')} items={groupedNotifications.thisWeek} />
                        <NotificationGroup title={t('notifications.older')} items={groupedNotifications.older} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsScreen;