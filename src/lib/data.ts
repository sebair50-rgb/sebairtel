
"use client";

import type { User, Post, Notification, Call, Chat, Message } from './types';

/**
 * @fileOverview Standardized production data schema.
 * All dynamic data is now handled exclusively via Firestore listeners.
 */

export const initialUsers: User[] = [];
export const initialFriendRequests: User[] = [];
export const initialChats: Chat[] = [];
export const initialPosts: Post[] = [];
export const initialNotifications: Notification[] = [];
export const initialCalls: Call[] = [];
