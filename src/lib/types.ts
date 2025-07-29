
import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string; // Changed to string for Firestore UID
  name: string;
  avatar: string;
  isFriend?: boolean;
  requestSent?: boolean;
  email?: string;
  phone?: string;
  dob?: string;
}

export interface Message {
    id: string; // Changed for Firestore
    user: string;
    userId: string;
    avatar: string;
    text?: string;
    time: string;
    timestamp: Timestamp;
    status: 'sent' | 'delivered' | 'seen';
    type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'code';
    src?: string;
    fileInfo?: {
      name: string;
      size: number;
      type: string;
    };
    replyTo?: string | null;
    likedBy?: string[];
    suggestions?: string[];
}


export interface Chat {
  id: string; // Firestore document ID
  name: string;
  avatar: string;
  users: string[]; // array of user uids
  // messages are now a subcollection
  unreadCount?: number;
  lastMessageTime?: string;
  lastMessageTimestamp?: Timestamp;
  isMuted?: boolean;
  isBlocked?: boolean;
}


export interface Comment {
  user: string;
  text: string;
  timestamp: Timestamp;
}

export interface Post {
  id: string; // Firestore document ID
  user: string;
  userId: string;
  avatar: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    src: string;
  } | null;
  time: string;
  timestamp: Timestamp;
  likedBy?: string[];
  isSaved?: boolean; // This will be client-side state
  comments: Comment[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'request';
  user: string;
  message: string;
  time: string;
  timestamp: Timestamp;
  isRead: boolean;
}

export interface Call {
    id: string;
    user: string;
    avatar: string;
    type: 'incoming' | 'outgoing' | 'missed';
    time: string;
    timestamp: Timestamp;
    duration?: string;
}
