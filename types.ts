

export enum PostType {
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

export enum PostPrivacy {
  Public = 'Public',
  Followers = 'Followers',
  Twins = 'Twins',
}

export enum ActivityStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
}

export interface ActivityLogEntry {
  postId: string;
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
  password?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  interests: string[];
  birthday?: string; // e.g., 'YYYY-MM-DD'
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  followers: string[]; // array of user ids
  following: string[]; // array of user ids
  reposts: string[]; // array of post ids
  savedPosts: string[]; // array of post ids
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

export interface Post {
  id: string;
  type: PostType;
  author: User;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  budget: number;
  interestedUsers: string[]; // array of user ids
  comments: Comment[];
  createdAt: string;
  media?: Media[];
  privacy: PostPrivacy;
}

export interface Story {
  id: string;
  author: User;
  media: Media;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: User;
  messages: Message[];
  lastMessage: Message;
}

export interface Notification {
  id: string;
  type: NotificationType;
  user: User; // The user who triggered the notification
  post?: Post;
  text: string;
  createdAt: string;
  read: boolean;
  // For attendance requests
  attendeeId?: string; 
  attendeeName?: string;
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
  | 'language';