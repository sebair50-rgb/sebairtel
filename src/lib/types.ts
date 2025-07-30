
import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string; // Changed to string for Firestore UID
  name: string;
  avatar: string; // Now represents photoURL
  isFriend?: boolean;
  requestSent?: boolean;
  email?: string;
  dob?: string;
  bio?: string;
  phone?: string;
  friends?: string[];
  isOnline?: boolean;
  lastSeen?: Timestamp;
}

export interface Message {
    id: string; // Changed for Firestore
    user: string;
    userId: string;
    avatar: string; // photoURL
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
}


export interface Chat {
  id: string; // Firestore document ID
  name: string;
  avatar: string; // photoURL
  users: string[]; // array of user uids
  userInfo: { [key: string]: { id: string; name: string; avatar: string; }};
  unreadCount?: { [key: string]: number }; // Unread count per user UID
  lastMessageTime?: string;
  lastMessageText?: string;
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
  avatar: string; // photoURL
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

export interface Call {
    id: string;
    user: string;
    avatar: string; // photoURL
    type: 'incoming' | 'outgoing' | 'missed';
    time: string;
    timestamp: Timestamp;
    duration?: string;
}

export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected';

export interface CallState {
    status: CallStatus;
    user?: User;
    type?: 'audio' | 'video';
}

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'new_friend' | 'missed_call' | 'new_message';
    message: string;
    fromUser: {
        id: string;
        name: string;
        avatar: string; // photoURL
    };
    timestamp: Timestamp;
    isRead: boolean;
    link?: string;
}
