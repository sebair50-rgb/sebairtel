

export interface User {
  id: number;
  name: string;
  avatar: string;
  isFriend?: boolean;
  requestSent?: boolean;
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

export interface Call {
    id: number;
    user: string;
    avatar: string;
    type: 'incoming' | 'outgoing' | 'missed';
    time: string;
    duration?: string;
}
