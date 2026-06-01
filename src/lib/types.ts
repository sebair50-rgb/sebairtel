
import type { Timestamp } from 'firebase/firestore';

export interface WorkExperience {
  title: string;
  company: string;
}

export interface Education {
  school: string;
  degree: string;
}

export interface UserLink {
  title: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  dob?: string;
  bio?: string;
  phone?: string;
  city?: string;
  from?: string;
  friends?: string[];
  friendRequestsReceived?: string[];
  friendRequestsSent?: string[];
  isOnline?: boolean;
  lastSeen?: Timestamp;
  settings?: import('@/store/AppContext').AppSettings;
  links?: UserLink[];
  workExperience?: WorkExperience[];
  education?: Education[];
  relationshipStatus?: string;
}

export interface Message {
    id: string;
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
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  users: string[];
  userInfo: { [key: string]: { id: string; name: string; avatar: string; }};
  unreadCount?: { [key: string]: number };
  lastMessageTime?: string;
  lastMessageText?: string;
  lastMessageTimestamp?: Timestamp;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export interface Comment {
  user: string;
  userId: string;
  avatar: string;
  text: string;
  timestamp: Timestamp;
}

export interface Reaction {
    userId: string;
    emoji: string;
}

export interface Post {
  id: string;
  user: string;
  userId: string;
  avatar: string;
  content: string;
  mediaType?: 'image' | 'video' | 'code' | 'text';
  mediaSrc?: string;
  time: string;
  timestamp: Timestamp;
  reactions: Reaction[];
  comments: Comment[];
}

export interface NewsItem {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    timestamp: Timestamp;
    author?: string;
    link?: string;
}

export interface MarketItem {
    id: string;
    userId: string;
    title: string;
    description: string;
    price?: number;
    category: 'job' | 'service' | 'product';
    timestamp: Timestamp;
    image?: string;
}

export interface Store {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    category: 'market' | 'pharmacy' | 'service';
    image: string;
    location?: string;
    timestamp: Timestamp;
}

export interface Call {
    id: string;
    user: string;
    userId: string;
    avatar: string;
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
    type: 'like' | 'comment' | 'new_friend' | 'missed_call' | 'new_message' | 'friend_request' | 'reaction';
    message: string;
    fromUser: {
        id: string;
        name: string;
        avatar: string;
    };
    timestamp: Timestamp;
    isRead: boolean;
    link?: string;
}
