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
  timestamp: string;
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
  birthday?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  followers: string[];
  following: string[];
  reposts: string[];
  savedPosts: string[];
  activityLog: ActivityLogEntry[];
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
  authorId: string;
  author?: User;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  budget: number;
  interestedUsers: string[];
  comments: Comment[];
  createdAt: string;
  media?: Media[];
  privacy: PostPrivacy;
  completedBy?: string[];
  approvedCompletions?: string[];
}

export type HydratedPost = Post & {
  author: User;
};

export interface Story {
  id: string;
  authorId: string;
  author?: User;
  media: Media;
  createdAt: string;
}

export type HydratedStory = Story & {
  author: User;
};

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
  recipientId: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  post?: {
    id: string;
    title?: string;
  };
  postId?: string;
  senderId?: string;
  attendeeId?: string;
  text: string;
  read: boolean;
  createdAt: string;
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
  | 'savedPosts';
