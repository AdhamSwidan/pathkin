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
