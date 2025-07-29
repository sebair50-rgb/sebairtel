
import type { User, Post, Notification, Call, Chat, Message } from './types';
import { Timestamp } from 'firebase/firestore';

// THIS FILE IS NOW DEPRECATED FOR MOST DATA.
// Data is now fetched from Firestore. This file can be used for initial/mock data if needed.

export const CURRENT_USER: User = { id: '100', name: 'أنت', avatar: '👤' };

export const initialUsers: User[] = [];
export const initialFriendRequests: User[] = [];
export const initialChats: Chat[] = [];
export const initialPosts: Post[] = [];
export const initialNotifications: Notification[] = [];
export const initialCalls: Call[] = [];
