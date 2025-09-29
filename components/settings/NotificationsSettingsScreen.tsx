import React from 'react';
import Header from '../Header';
import ToggleSwitch from '../ToggleSwitch';

interface NotificationsSettingsScreenProps {
  onBack: () => void;
}

const NotificationItem: React.FC<{ label: string; description: string; initialChecked: boolean }> = ({ label, description, initialChecked }) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex-grow text-left pr-4">
            <span className="text-base text-white">{label}</span>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <ToggleSwitch initialChecked={initialChecked} />
    </div>
);

const NotificationsSettingsScreen: React.FC<NotificationsSettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <Header title="Notifications" onBack={onBack} />
      <div className="flex-grow overflow-y-auto text-white">
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-sm font-semibold text-gray-400">Push Notifications</h2>
        </div>
        <div className="bg-neutral-900 mx-4 rounded-lg divide-y divide-neutral-700/50">
           <NotificationItem label="New Messages" description="When you receive a new private message" initialChecked={true} />
           <NotificationItem label="New Comments" description="When someone comments on your post" initialChecked={true} />
           <NotificationItem label="New 'Interested'" description="When someone is interested in your post" initialChecked={true} />
           <NotificationItem label="Event Reminders" description="Get notified before an event starts" initialChecked={false} />
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettingsScreen;