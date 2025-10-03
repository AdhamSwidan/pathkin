export enum AdventureType {
  Travel = 'Travel',
  Housing = 'Housing',
  Event = 'Event',
  Hiking = 'Hiking',
  Camping = 'Camping',
  Volunteering = 'Volunteering',
  Cycling = 'Cycling',
}

export enum NotificationType {
  Interest = 'interest',
  Comment = 'comment',
  Message = 'message',
  AttendanceRequest = 'attendanceRequest',
  AttendanceConfirmed = 'attendanceConfirmed',
  RateExperience = 'rateExperience',
}

export enum AdventurePrivacy {
  Public = 'Public',
  Followers = 'Followers',
  Twins = 'Twins',
}

export enum ActivityStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
}

export interface ActivityLogEntry {
  adventureId: string;
  status: ActivityStatus;
}

export interface PrivacySettings {
  showFollowLists: boolean;
  showStats: boolean;
  showCompletedActivities: boolean;
  allowTwinSearch: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  interests: string[];
  birthday?: string; // e.g., 'YYYY-MM-DD'
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country?: string;
  followers: string[]; // array of user ids
  following: string[]; // array of user ids
  repostedAdventures: string[]; // array of adventure ids
  savedAdventures: string[]; // array of adventure ids
  activityLog: ActivityLogEntry[]; // Replaces completedActivities
  averageRating?: number;
  totalRatings?: number;
  isPrivate: boolean;
  privacySettings: PrivacySettings;
}

export interface Media {
  url: string;
  type: 'image' | 'video';
}

export interface Adventure {
  id: string;
  type: AdventureType;
  authorId: string;
  author?: User; // This is added during hydration, not in DB
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  budget: number;
  interestedUsers: string[]; // array of user ids
  commentCount: number; // Replaces storing comments array directly
  createdAt: string;
  media?: Media[];
  privacy: AdventurePrivacy;
}

// An Adventure that has been "hydrated" with its author's data
export type HydratedAdventure = Omit<Adventure, 'author'> & {
  author: User;
};

export interface Story {
  id: string;
  authorId: string;
  author?: User;
  media: Media;
  createdAt: string;
}

// A Story that has been "hydrated" with its author's data
export type HydratedStory = Story & {
  author: User;
};

export interface Comment {
  id: string;
  authorId: string; // Changed from full User object
  author?: User; // Added during hydration
  text: string;
  createdAt: string;
}

export type HydratedComment = Omit<Comment, 'author'> & {
  author: User;
};


export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of two user IDs
  lastMessage?: Message;
  updatedAt: string;
  unreadCount?: { [key: string]: number; };
}

// Fix: Changed from Omit<Conversation, 'participants'> to Conversation to resolve a type predicate error in App.tsx.
export type HydratedConversation = Conversation & {
    participant: User; // The other user in the chat
};


export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string; // The user who should receive this notification
  userId: string; // The user who triggered the notification
  adventureId?: string;
  text: string;
  createdAt: string;
  read: boolean;
  // For attendance requests
  attendeeId?: string; 
  attendeeName?: string;
}

// Fix: Corrected HydratedNotification to ensure type compatibility for the type predicate in App.tsx.
export type HydratedNotification = Notification & {
    user: User;
    adventure?: HydratedAdventure;
}

export type Screen = 
  | 'feed' 
  | 'map' 
  | 'create' 
  | 'search'
  | 'chat' 
  | 'profile' 
  | 'chatDetail' 
  | 'findTwins' 
  | 'userProfile'
  | 'settings'
  | 'editProfile'
  | 'privacySecurity'
  | 'language'
  | 'savedAdventures'
  | 'notifications';