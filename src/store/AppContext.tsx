
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import type { User, Post, Call, Chat, Message, CallState, Notification, NewsItem, MarketItem, Store } from '@/lib/types';
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
  isLoadingProfile: boolean;
  updateUserProfile: (data: Partial<User>, files?: { avatar?: File }) => Promise<void>;
  posts: Post[];
  news: NewsItem[];
  marketItems: MarketItem[];
  stores: Store[];
  addPost: (post: { content: string, mediaType?: 'image' | 'video' | 'code', mediaFile?: File }) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  calls: Call[];
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  chats: Chat[];
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
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState('social');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [initialContactTab, setInitialContactTab] = useState<'chats' | 'friends' | 'requests'>('friends');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [users, setUsers] = useState<User[]>([]);
  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const storage = getStorage();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
        setCurrentUser(null);
        setIsLoadingProfile(false);
        return;
    }

    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
        if (snap.exists()) {
            const data = snap.data() as User;
            setCurrentUser({ ...data, id: snap.id });
            if (data.settings) {
                setSettings(prev => ({ ...prev, ...data.settings }));
                if (data.settings.language && data.settings.language !== 'system') {
                    setLanguage(data.settings.language);
                }
            }
        }
        setIsLoadingProfile(false);
    });

    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data(), time: d.data().timestamp?.toDate().toLocaleTimeString() || '' } as Post)));
    });

    const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('timestamp', 'desc'), limit(20)), (snap) => {
        setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)));
    });

    const unsubMarket = onSnapshot(query(collection(db, 'market_items'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
        setMarketItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketItem)));
    });

    const unsubStores = onSnapshot(query(collection(db, 'stores'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
        setStores(snap.docs.map(d => ({ id: d.id, ...d.data() } as Store)));
    });

    const unsubChats = onSnapshot(query(collection(db, 'chats'), where('users', 'array-contains', authUser.uid)), async (snap) => {
        const data = snap.docs.map(d => {
            const chat = d.data();
            const otherId = chat.users.find((id: string) => id !== authUser.uid);
            const otherInfo = chat.userInfo?.[otherId] || { name: 'Unknown', avatar: '' };
            return {
                id: d.id,
                ...chat,
                name: otherInfo.name,
                avatar: otherInfo.avatar,
                lastMessageTime: chat.lastMessageTimestamp?.toDate().toLocaleTimeString() || '',
            } as Chat;
        });
        setChats(data.sort((a, b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0)));
    });

    const unsubNotifs = onSnapshot(query(collection(db, `users/${authUser.uid}/notifications`), orderBy('timestamp', 'desc'), limit(30)), (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(data);
        setUnreadNotificationCount(data.filter(n => !n.isRead).length);
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users'), limit(100)), (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)).filter(u => u.id !== authUser.uid));
    });

    return () => {
        unsubUser(); unsubPosts(); unsubNews(); unsubMarket(); unsubStores(); unsubChats(); unsubNotifs(); unsubUsers();
    };
  }, [authUser, authLoading, setLanguage]);

  const friends = useMemo(() => {
      const fIds = new Set(currentUser?.friends || []);
      return users.filter(u => fIds.has(u.id));
  }, [users, currentUser]);

  const friendRequests = useMemo(() => {
      const rIds = new Set(currentUser?.friendRequestsReceived || []);
      return users.filter(u => rIds.has(u.id));
  }, [users, currentUser]);

  const suggestedUsers = useMemo(() => {
      const excluded = new Set([...(currentUser?.friends || []), ...(currentUser?.friendRequestsReceived || []), ...(currentUser?.friendRequestsSent || [])]);
      return users.filter(u => !excluded.has(u.id));
  }, [users, currentUser]);

  const updateUserProfile = async (data: Partial<User>, files?: { avatar?: File }) => {
    if (!auth.currentUser) return;
    const updatePayload: any = { ...data };
    if (files?.avatar) {
        const sRef = ref(storage, `avatars/${auth.currentUser.uid}/${Date.now()}`);
        await uploadBytes(sRef, files.avatar);
        const url = await getDownloadURL(sRef);
        updatePayload.avatar = url;
        await updateProfile(auth.currentUser, { photoURL: url });
    }
    if (data.name) await updateProfile(auth.currentUser, { displayName: data.name });
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { ...updatePayload, settings });
  };

  const addPost = async (data: { content: string, mediaType?: 'image' | 'video' | 'code', mediaFile?: File }) => {
    if (!currentUser) return;
    let mUrl = undefined;
    if (data.mediaFile) {
        const sRef = ref(storage, `posts/${currentUser.id}/${Date.now()}_${data.mediaFile.name}`);
        await uploadBytes(sRef, data.mediaFile);
        mUrl = await getDownloadURL(sRef);
    }
    await addDoc(collection(db, 'posts'), {
      content: data.content,
      mediaType: data.mediaType || 'text',
      mediaSrc: mUrl,
      user: currentUser.name,
      userId: currentUser.id,
      avatar: currentUser.avatar,
      reactions: [],
      comments: [],
      timestamp: serverTimestamp(),
    });
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "posts", postId), {
      comments: arrayUnion({ text, user: currentUser.name, userId: currentUser.id, avatar: currentUser.avatar, timestamp: Timestamp.now() })
    });
  };

  const createChat = async (friend: User): Promise<Chat | null> => {
    if (!currentUser) return null;
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.id));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => d.data().users.includes(friend.id));
    if (existing) { setSelectedChatId(existing.id); return { id: existing.id, ...existing.data() } as Chat; }
    const nRef = doc(collection(db, 'chats'));
    const cData = {
        id: nRef.id,
        users: [currentUser.id, friend.id],
        userInfo: { 
            [currentUser.id]: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }, 
            [friend.id]: { id: friend.id, name: friend.name, avatar: friend.avatar } 
        },
        lastMessageTimestamp: serverTimestamp(),
        lastMessageText: 'Started conversation',
        unreadCount: { [currentUser.id]: 0, [friend.id]: 0 }
    };
    await setDoc(nRef, cData);
    setSelectedChatId(nRef.id);
    return cData as any;
  };

  const sendFriendRequest = async (target: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friendRequestsSent: arrayUnion(target.id) });
    batch.update(doc(db, 'users', target.id), { friendRequestsReceived: arrayUnion(currentUser.id) });
    await batch.commit();
    await addDoc(collection(db, `users/${target.id}/notifications`), {
        type: 'friend_request',
        message: `<strong>${currentUser.name}</strong> sent you a friend request.`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        timestamp: serverTimestamp(),
        isRead: false,
        link: '/contact'
    });
  };

  const acceptFriendRequest = async (user: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friends: arrayUnion(user.id), friendRequestsReceived: arrayRemove(user.id) });
    batch.update(doc(db, 'users', user.id), { friends: arrayUnion(currentUser.id), friendRequestsSent: arrayRemove(currentUser.id) });
    await batch.commit();
    await addDoc(collection(db, `users/${user.id}/notifications`), {
        type: 'new_friend',
        message: `<strong>${currentUser.name}</strong> accepted your friend request.`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        timestamp: serverTimestamp(),
        isRead: false,
        link: '/contact'
    });
  };

  const addMessage = async (chatId: string, msg: any) => {
    if (!currentUser) return;
    const cRef = doc(db, 'chats', chatId);
    await addDoc(collection(cRef, 'messages'), { ...msg, timestamp: serverTimestamp(), userId: currentUser.id, user: currentUser.name, avatar: currentUser.avatar });
    const snap = await getDoc(cRef);
    const oId = snap.data()?.users.find((id: string) => id !== currentUser.id);
    await updateDoc(cRef, { lastMessageTimestamp: serverTimestamp(), lastMessageText: msg.text || 'Sent an attachment', [`unreadCount.${oId}`]: increment(1) });
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => { batch.update(doc(db, `users/${currentUser.id}/notifications`, n.id), { isRead: true }); });
    await batch.commit();
  };

  const deleteNotifications = async (ids: string[]) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    ids.forEach(id => { batch.delete(doc(db, `users/${currentUser.id}/notifications`, id)); });
    await batch.commit();
  };

  const readChatAloud = async () => {
    if (isReadingAloud) { ttsAudioRef.current?.pause(); setIsReadingAloud(false); return; }
    if (!selectedChatId) return;
    setIsReadingAloud(true);
    const snap = await getDocs(query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(5)));
    const text = snap.docs.reverse().map(d => `${d.data().user}: ${d.data().text || 'Attachment'}`).join('. ');
    if (!text) { setIsReadingAloud(false); return; }
    try {
        const { audioUrl } = await textToSpeech({ text });
        ttsAudioRef.current = new Audio(audioUrl);
        ttsAudioRef.current.play();
        ttsAudioRef.current.onended = () => setIsReadingAloud(false);
    } catch (e) { console.error("TTS failed", e); setIsReadingAloud(false); }
  };

  const fetchSmartReplies = async () => {
    if (!selectedChatId) return;
    const snap = await getDocs(query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(5)));
    const history = snap.docs.reverse().map(d => `${d.data().user}: ${d.data().text || ''}`).join('\n');
    if (!history) return;
    try {
        const res = await smartReplySuggestions({ history });
        setSmartReplies(res.suggestions);
    } catch (e) { console.error("Smart replies failed", e); }
  };

  return (
    <AppContext.Provider value={{
        currentUser, isLoadingProfile, updateUserProfile, posts, news, marketItems, stores, addPost, updatePost: (id, data) => updateDoc(doc(db, "posts", id), data), deletePost: (id) => deleteDoc(doc(db, 'posts', id)), addComment,
        calls, settings, setSettings, chats, selectedChatId, setSelectedChatId, activeTab, setActiveTab, initialContactTab, setInitialContactTab,
        addMessage, deleteMessage: (cid, mid) => deleteDoc(doc(db, 'chats', cid, 'messages', mid)), updateMessage: (cid, mid, data) => updateDoc(doc(db, "chats", cid, "messages", mid), data), users, friends, suggestedUsers, friendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest: (u) => writeBatch(db).update(doc(db, 'users', currentUser!.id), { friendRequestsReceived: arrayRemove(u.id) }).update(doc(db, 'users', u.id), { friendRequestsSent: arrayRemove(currentUser!.id) }).commit(),
        createChat, unfriendUser: (fid) => writeBatch(db).update(doc(db, 'users', currentUser!.id), { friends: arrayRemove(fid) }).update(doc(db, 'users', fid), { friends: arrayRemove(currentUser!.id) }).commit(), callState, initiateCall: (u, t) => { setCallState({ status: 'outgoing', user: u, type: t }); setTimeout(() => setCallState(p => p.status === 'outgoing' ? { ...p, status: 'connected' } : p), 3000); }, answerCall: () => setCallState(p => ({ ...p, status: 'connected' })), endCall: () => setCallState({ status: 'idle' }), notifications, unreadNotificationCount, markNotificationsAsRead,
        deleteNotifications, readChatAloud, isReadingAloud, smartReplies, fetchSmartReplies, clearSmartReplies: () => setSmartReplies([])
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
