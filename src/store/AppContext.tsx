
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import type { User, Post, Call, Chat, Message, CallState, Notification, Comment } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch, increment, limit, arrayUnion, arrayRemove, Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from 'firebase/auth';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { smartReplySuggestions } from '@/ai/flows/smart-reply';
import { useTranslation } from './LanguageContext';

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'ar' | 'system';
    notifications: {
        all: boolean;
        messages: boolean;
        mentions: boolean;
        calls: boolean;
    };
    privacy: {
        lastSeen: 'everyone' | 'friends' | 'nobody';
        profilePhoto: 'everyone' | 'friends';
        friendRequests: 'everyone' | 'friends_of_friends';
    };
    sounds: {
        messageTone: string;
        notificationTone: string;
        callRingtone: string;
    };
    interface: {
        showSocialTab: boolean;
        showAiTab: boolean;
        showAppsTab: boolean;
        showContactTab: boolean;
    };
}

interface AppContextType {
  currentUser: User | null;
  updateUserProfile: (data: Partial<User>, files?: { avatar?: File | string }) => Promise<void>;
  posts: Post[];
  addPost: (post: { content: string, mediaType?: 'image' | 'video' | 'code', mediaSrc?: string }) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  editingPost: Post | null;
  startEditPost: (post: Post) => void;
  cancelEditPost: () => void;
  calls: Call[];
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  initialContactTab: 'chats' | 'friends' | 'requests';
  setInitialContactTab: (tab: 'chats' | 'friends' | 'requests') => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'time'>) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => Promise<void>;
  users: User[];
  friends: User[];
  suggestedUsers: User[];
  friendRequests: User[];
  sendFriendRequest: (targetUser: User) => Promise<void>;
  acceptFriendRequest: (requestingUser: User) => Promise<void>;
  declineFriendRequest: (requestingUser: User) => Promise<void>;
  createChat: (friend: User) => Promise<Chat | null>;
  unfriendUser: (friendId: string) => Promise<void>;
  callState: CallState;
  initiateCall: (user: User, type: 'audio' | 'video') => void;
  answerCall: () => void;
  endCall: () => void;
  addMissedCall: (user: User) => void;
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  createNotification: (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  readChatAloud: () => Promise<void>;
  isReadingAloud: boolean;
  smartReplies: string[];
  fetchSmartReplies: () => Promise<void>;
  clearSmartReplies: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const defaultSettings: AppSettings = {
    theme: 'system',
    language: 'system',
    notifications: { all: true, messages: true, mentions: true, calls: true },
    privacy: { lastSeen: 'everyone', profilePhoto: 'everyone', friendRequests: 'everyone' },
    sounds: { messageTone: 'default', notificationTone: 'default', callRingtone: 'default' },
    interface: { showSocialTab: true, showAiTab: true, showAppsTab: true, showContactTab: true },
};

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { authUser, loading: authLoading } = useAuth();
  const { setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState('social');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [initialContactTab, setInitialContactTab] = useState<'chats' | 'friends' | 'requests'>('friends');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const startEditPost = (post: Post) => setEditingPost(post);
  const cancelEditPost = () => setEditingPost(null);

  useEffect(() => {
    if (authLoading || !authUser) return;

    const userDocRef = doc(db, 'users', authUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser({ id: userDoc.id, ...userData });
            if (userData.settings) setSettings(prev => ({ ...prev, ...userData.settings }));
        }
    });

    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().timestamp?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
      } as Post)));
    });

    const chatsQuery = query(collection(db, 'chats'), where('users', 'array-contains', authUser.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
        const chatsDataPromises = snapshot.docs.map(async (chatDoc) => {
             const data = chatDoc.data();
             const otherUserId = data.users.find((id: string) => id !== authUser.uid);
             const otherUserInfo = data.userInfo?.[otherUserId] || { name: 'Unknown', avatar: '' };
             return {
                 id: chatDoc.id,
                 ...data,
                 name: otherUserInfo.name,
                 avatar: otherUserInfo.avatar,
                 lastMessageTime: data.lastMessageTimestamp?.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) || '',
             } as Chat;
        });
        const chatsData = await Promise.all(chatsDataPromises);
        setChats(chatsData.sort((a, b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0)));
    });

    const notificationsQuery = query(collection(db, `users/${authUser.uid}/notifications`), orderBy('timestamp', 'desc'), limit(30));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(data);
        setUnreadNotificationCount(data.filter(n => !n.isRead).length);
    });

    return () => {
      unsubscribeUser(); unsubscribePosts(); unsubscribeChats(); unsubscribeNotifications();
    };
  }, [authUser, authLoading]);

  useEffect(() => {
    if (!authUser) return;
    const fetchUsers = async () => {
        const snapshot = await getDocs(query(collection(db, 'users'), limit(100)));
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)).filter(u => u.id !== authUser.uid));
    };
    fetchUsers();
  }, [authUser]);

  useEffect(() => {
      if (!currentUser || users.length === 0) {
          setFriends([]); setFriendRequests([]); setSuggestedUsers([]); return;
      }
      const fIds = new Set(currentUser.friends || []);
      const rIds = new Set(currentUser.friendRequestsReceived || []);
      const sIds = new Set(currentUser.friendRequestsSent || []);
      setFriends(users.filter(u => fIds.has(u.id)));
      setFriendRequests(users.filter(u => rIds.has(u.id)));
      setSuggestedUsers(users.filter(u => !fIds.has(u.id) && !rIds.has(u.id) && !sIds.has(u.id)));
  }, [users, currentUser]);

  const addPost = async (data: { content: string, mediaType?: 'image' | 'video' | 'code', mediaSrc?: string }) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'posts'), {
      ...data, user: currentUser.name, userId: currentUser.id, avatar: currentUser.avatar,
      reactions: [], comments: [], timestamp: serverTimestamp(),
    });
  };

  const updatePost = async (id: string, data: Partial<Post>) => await updateDoc(doc(db, "posts", id), data);
  const deletePost = async (id: string) => await deleteDoc(doc(db, 'posts', id));
  
  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "posts", postId), {
      comments: arrayUnion({ text, user: currentUser.name, userId: currentUser.id, avatar: currentUser.avatar, timestamp: Timestamp.now() })
    });
  };

  const updateUserProfile = async (data: Partial<User>, files?: { avatar?: File | string }) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const updateData: any = { ...data };
    if (files?.avatar) {
        const file = typeof files.avatar === 'string' ? await (await fetch(files.avatar)).blob() : files.avatar;
        const storageRef = ref(getStorage(), `avatars/${auth.currentUser.uid}/${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        updateData.avatar = url;
        await updateProfile(auth.currentUser, { photoURL: url });
    }
    if (data.name) await updateProfile(auth.currentUser, { displayName: data.name });
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { ...updateData, settings });
  };

  const createChat = async (friend: User): Promise<Chat | null> => {
    if (!currentUser) return null;
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.id));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => d.data().users.includes(friend.id));
    if (existing) return { id: existing.id, ...existing.data() } as Chat;
    const newRef = doc(collection(db, 'chats'));
    const chatData = {
        id: newRef.id, users: [currentUser.id, friend.id],
        userInfo: { [currentUser.id]: { name: currentUser.name, avatar: currentUser.avatar }, [friend.id]: { name: friend.name, avatar: friend.avatar } },
        lastMessageTimestamp: serverTimestamp(), lastMessageText: 'Started conversation', unreadCount: { [currentUser.id]: 0, [friend.id]: 0 }
    };
    await setDoc(newRef, chatData);
    return chatData as any;
  };

  const sendFriendRequest = async (target: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friendRequestsSent: arrayUnion(target.id) });
    batch.update(doc(db, 'users', target.id), { friendRequestsReceived: arrayUnion(currentUser.id) });
    await batch.commit();
    await addDoc(collection(db, `users/${target.id}/notifications`), {
        type: 'friend_request', message: `<strong>${currentUser.name}</strong> sent you a friend request.`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }, timestamp: serverTimestamp(), isRead: false, link: '/contact'
    });
  };

  const acceptFriendRequest = async (user: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friends: arrayUnion(user.id), friendRequestsReceived: arrayRemove(user.id) });
    batch.update(doc(db, 'users', user.id), { friends: arrayUnion(currentUser.id), friendRequestsSent: arrayRemove(currentUser.id) });
    await batch.commit();
  };

  const declineFriendRequest = async (user: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friendRequestsReceived: arrayRemove(user.id) });
    batch.update(doc(db, 'users', user.id), { friendRequestsSent: arrayRemove(currentUser.id) });
    await batch.commit();
  };

  const addMessage = async (chatId: string, msg: any) => {
    if (!currentUser) return;
    const chatRef = doc(db, 'chats', chatId);
    await addDoc(collection(chatRef, 'messages'), { ...msg, timestamp: serverTimestamp() });
    const otherId = (await getDoc(chatRef)).data()?.users.find((id: string) => id !== currentUser.id);
    await updateDoc(chatRef, { lastMessageTimestamp: serverTimestamp(), lastMessageText: msg.text || 'Sent an attachment', [`unreadCount.${otherId}`]: increment(1) });
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => batch.update(doc(db, `users/${currentUser.id}/notifications`, n.id), { isRead: true }));
    await batch.commit();
  };

  const deleteNotifications = async (ids: string[]) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(doc(db, `users/${currentUser.id}/notifications`, id)));
    await batch.commit();
  };

  const initiateCall = (user: User, type: 'audio' | 'video') => {
    setCallState({ status: 'outgoing', user, type });
    setTimeout(() => setCallState(prev => prev.status === 'outgoing' ? { ...prev, status: 'connected' } : prev), 3000);
  };

  const endCall = () => setCallState({ status: 'idle' });
  const answerCall = () => setCallState(prev => ({ ...prev, status: 'connected' }));
  const addMissedCall = () => {};

  const readChatAloud = async () => {
    if (isReadingAloud) { ttsAudioRef.current?.pause(); setIsReadingAloud(false); return; }
    if (!selectedChatId) return;
    setIsReadingAloud(true);
    const snap = await getDocs(query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(5)));
    const text = snap.docs.reverse().map(d => `${d.data().user}: ${d.data().text || 'Attachment'}`).join('. ');
    const { audioUrl } = await textToSpeech({ text });
    ttsAudioRef.current = new Audio(audioUrl);
    ttsAudioRef.current.play();
    ttsAudioRef.current.onended = () => setIsReadingAloud(false);
  };

  const fetchSmartReplies = async () => {
    if (!selectedChatId) return;
    const snap = await getDocs(query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(5)));
    const history = snap.docs.reverse().map(d => d.data().text || '').join('\n');
    const res = await smartReplySuggestions({ history });
    setSmartReplies(res.suggestions);
  };

  return (
    <AppContext.Provider value={{
        currentUser, updateUserProfile, posts, addPost, updatePost, deletePost, addComment, editingPost, startEditPost, cancelEditPost,
        calls, settings, setSettings, chats, setChats, selectedChatId, setSelectedChatId, activeTab, setActiveTab, initialContactTab, setInitialContactTab,
        addMessage, deleteMessage: async () => {}, updateMessage: async () => {}, users, friends, suggestedUsers, friendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest,
        createChat, unfriendUser: async () => {}, callState, initiateCall, answerCall, endCall, addMissedCall, notifications, unreadNotificationCount, markNotificationsAsRead,
        createNotification: async () => {}, deleteNotifications, readChatAloud, isReadingAloud, smartReplies, fetchSmartReplies, clearSmartReplies: () => setSmartReplies([])
    }}>
        {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};
