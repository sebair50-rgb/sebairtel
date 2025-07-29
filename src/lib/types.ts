export interface User {
  id: number;
  name: string;
  avatar: string;
  isFriend?: boolean;
  requestSent?: boolean;
}

export interface Reply {
  id: number;
  user: string;
  text: string;
}

export interface FileInfo {
  name: string;
  size?: number;
  type: string;
}

export interface Message {
  id: number;
  user: string;
  avatar: string;
  type: 'text' | 'image' | 'video' | 'file' | 'code';
  text?: string;
  src?: string;
  fileInfo?: FileInfo;
  time: string;
  status: 'sent' | 'delivered' | 'seen';
  replyTo?: number | null;
  suggestions?: string[];
  deleted?: boolean;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
  unreadCount?: number;
  isMuted?: boolean;
  isBlocked?: boolean;
  lastMessageTime?: string;
}

export interface Comment {
  user: string;
  text: string;
}

export interface Post {
  id: number;
  user: string;
  avatar: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    src: string;
  } | null;
  time: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
}

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'request';
  user: string;
  message: string;
  time: string;
  isRead: boolean;
}
