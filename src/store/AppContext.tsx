"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import type { User, Post, Call, Chat, Message, CallState, Notification } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch, increment, limit, arrayUnion, arrayRemove, Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { updateProfile } from 'firebase/auth';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { smartReplySuggestions } from '@/ai/flows/smart-reply';
import { useTranslation } from './LanguageContext';

type Visibility = 'everyone' | 'friends' | 'nobody';
type FriendRequestSetting = 'everyone' | 'friends_of_friends';

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
        lastSeen: Visibility;
        profilePhoto: 'everyone' | 'friends';
        friendRequests: FriendRequestSetting;
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
    notifications: {
        all: true,
        messages: true,
        mentions: true,
        calls: true,
    },
    privacy: {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        friendRequests: 'everyone',
    },
    sounds: {
        messageTone: 'default',
        notificationTone: 'default',
        callRingtone: 'default',
    },
    interface: {
        showSocialTab: true,
        showAiTab: true,
        showAppsTab: true,
        showContactTab: true,
    },
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const startEditPost = (post: Post) => setEditingPost(post);
  const cancelEditPost = () => setEditingPost(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
             setSettings(prev => ({...prev, ...JSON.parse(savedSettings)}));
        }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('app-settings', JSON.stringify(settings));
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(settings.theme);
        }
    }
  }, [settings]);

  useEffect(() => {
      if (settings.language) setLanguage(settings.language);
  }, [settings.language, setLanguage]);

  const markChatAsRead = useCallback(async (chatId: string) => {
    if (!authUser) return;
    const chatRef = doc(db, 'chats', chatId);
    const fieldName = `unreadCount.${authUser.uid}`;
    try {
        await updateDoc(chatRef, { [fieldName]: 0 });
    } catch (e) {
        console.error("Error marking chat as read:", e);
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChatId) {
        markChatAsRead(selectedChatId);
        clearSmartReplies();
    }
  }, [selectedChatId, markChatAsRead]);

  useEffect(() => {
    if (!authUser) return;
    const userStatusRef = doc(db, 'users', authUser.uid);
    updateDoc(userStatusRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {});
    const handleBeforeUnload = () => updateDoc(userStatusRef, { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateDoc(userStatusRef, { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
    }
  }, [authUser]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setCurrentUser(null);
      setPosts([]);
      setChats([]);
      setUsers([]);
      setFriends([]);
      setSuggestedUsers([]);
      setCalls([]);
      setNotifications([]);
      return;
    };

    const userDocRef = doc(db, 'users', authUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, async (userDoc) => {
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser({ id: userDoc.id, ...userData });
            if (userData.settings) {
                 setSettings(prev => ({
                    ...defaultSettings,
                    ...userData.settings,
                    notifications: { ...defaultSettings.notifications, ...userData.settings.notifications },
                    privacy: { ...defaultSettings.privacy, ...userData.settings.privacy },
                    sounds: { ...defaultSettings.sounds, ...userData.settings.sounds },
                    interface: { ...defaultSettings.interface, ...userData.settings.interface },
                }));
            }
        } else {
            console.log("Creating initial user profile...");
            const newUser: Omit<User, 'id'> = {
                name: authUser.displayName || 'New User',
                email: authUser.email!,
                avatar: authUser.photoURL || `https://placehold.co/128x128/E6E6FA/333333.png?text=${(authUser.displayName || 'N').charAt(0)}`,
                friends: [],
                friendRequestsReceived: [],
                friendRequestsSent: [],
                isOnline: true,
                lastSeen: serverTimestamp() as any,
                settings: defaultSettings,
            };
            try {
                await setDoc(userDocRef, newUser);
                setCurrentUser({ id: authUser.uid, ...newUser });
            } catch (error) {
                console.error("Error creating user document:", error);
            }
        }
    });
    
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
              id: doc.id, 
              ...data,
              time: data.timestamp?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
          } as Post
      });
      setPosts(postsData);
    });

    const chatsQuery = query(collection(db, 'chats'), where('users', 'array-contains', authUser.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatsDataPromises = snapshot.docs.map(async (doc) => {
             const data = doc.data();
             const otherUserId = data.users.find((id: string) => id !== authUser.uid);
             let otherUserInfo: any;
             if (data.userInfo && data.userInfo[otherUserId]) {
                 otherUserInfo = data.userInfo[otherUserId];
             } else if (otherUserId) {
                 const userDoc = await getDoc(doc(db, 'users', otherUserId));
                 if (userDoc.exists()) otherUserInfo = { id: userDoc.id, ...userDoc.data() };
             }
             const unreadCount = (data.unreadCount && data.unreadCount[authUser.uid]) ? data.unreadCount[authUser.uid] : 0;
             return {
                 id: doc.id,
                 ...data,
                 name: otherUserInfo ? otherUserInfo.name : "Deleted User",
                 avatar: otherUserInfo ? otherUserInfo.avatar : "",
                 lastMessageText: data.lastMessageText || '...',
                 lastMessageTime: data.lastMessageTimestamp?.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) || '',
                 unreadCount: { [authUser.uid]: unreadCount },
             } as Chat;
        });
        Promise.all(chatsDataPromises).then(chatsData => {
            const sortedChats = chatsData.sort((a, b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0));
            setChats(sortedChats);
        });
    });

    const callsQuery = query(collection(db, `users/${authUser.uid}/calls`), orderBy('timestamp', 'desc'));
    const unsubscribeCalls = onSnapshot(callsQuery, (snapshot) => {
        const callsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                time: data.timestamp?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || ''
            } as Call;
        });
        setCalls(callsData);
    });
    
    const notificationsQuery = query(collection(db, `users/${authUser.uid}/notifications`), orderBy('timestamp', 'desc'));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(notificationsData);
        setUnreadNotificationCount(notificationsData.filter(n => !n.isRead).length);
    });

    return () => {
      unsubscribeUser();
      unsubscribePosts();
      unsubscribeChats();
      unsubscribeCalls();
      unsubscribeNotifications();
    };
  }, [authUser, authLoading]);

  useEffect(() => {
    if (!currentUser || !authUser) return;
    const fetchUsersInBatches = async (ids: string[]): Promise<User[]> => {
        if (ids.length === 0) return [];
        const userPromises = ids.slice(0, 30).map(id => getDoc(doc(db, 'users', id)));
        const userSnapshots = await Promise.all(userPromises);
        return userSnapshots.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() } as User));
    };
    const fetchRelatedUsers = async () => {
        try {
            const friendIds = currentUser.friends || [];
            const requestIds = currentUser.friendRequestsReceived || [];
            const relatedUsers = await fetchUsersInBatches([...new Set([...friendIds, ...requestIds])]);
            const suggestionsQuery = query(collection(db, 'users'), limit(20));
            const suggestionsSnapshot = await getDocs(suggestionsQuery);
            const suggestionDocs = suggestionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            const allFetchedUsers = [...relatedUsers, ...suggestionDocs];
            const uniqueUsers = Array.from(new Map(allFetchedUsers.map(u => [u.id, u])).values());
            setUsers(uniqueUsers.filter(u => u.id !== authUser.uid));
        } catch (error) {
            console.error("Error fetching related users:", error);
        }
    };
    fetchRelatedUsers();
  }, [currentUser, authUser]);

  useEffect(() => {
    const saveSettings = async () => {
        if (!authUser || authLoading || !currentUser) return;
        if (!currentUser.settings && JSON.stringify(settings) === JSON.stringify(defaultSettings)) return;
        const userDocRef = doc(db, 'users', authUser.uid);
        await updateDoc(userDocRef, { settings: settings }).catch(() => {});
    };
    const handler = setTimeout(saveSettings, 2000);
    return () => clearTimeout(handler);
  }, [settings, authUser, authLoading, currentUser]);

  useEffect(() => {
      if (!currentUser || users.length === 0) {
          setFriends([]); setFriendRequests([]); setSuggestedUsers([]); return;
      }
      const friendIds = new Set(currentUser.friends || []);
      const receivedRequestIds = new Set(currentUser.friendRequestsReceived || []);
      const sentRequestIds = new Set(currentUser.friendRequestsSent || []);
      const friendsList: User[] = [];
      const requestsList: User[] = [];
      const suggestionsList: User[] = [];
      users.forEach(user => {
          if (friendIds.has(user.id)) friendsList.push(user);
          else if (receivedRequestIds.has(user.id)) requestsList.push(user);
          else if (user.id !== currentUser.id && !sentRequestIds.has(user.id)) suggestionsList.push(user);
      });
      setFriends(friendsList); setFriendRequests(requestsList); setSuggestedUsers(suggestionsList);
  }, [users, currentUser]);
  
  const getMessageDescription = (msg: Message): string => {
    switch (msg.type) {
        case 'text': return msg.text || '';
        case 'image': return 'Sent an image';
        case 'video': return 'Sent a video';
        case 'audio': return 'Sent a voice message';
        case 'file': return `Sent a file: ${msg.fileInfo?.name || 'file'}`;
        case 'code': return 'Sent a code snippet';
        default: return 'Sent a message';
    }
  };

  const addPost = async (postData: { content: string, mediaType?: 'image' | 'video' | 'code', mediaSrc?: string }) => {
    if (!currentUser) return;
    const dataToSave: any = {
      content: postData.content,
      user: currentUser.name,
      userId: currentUser.id,
      avatar: currentUser.avatar,
      reactions: [],
      comments: [],
      timestamp: serverTimestamp(),
      mediaType: postData.mediaType || 'text',
      mediaSrc: postData.mediaSrc || null,
    };
    if (dataToSave.mediaType === 'text' && dataToSave.content.includes('```')) dataToSave.mediaType = 'code';
    await addDoc(collection(db, 'posts'), dataToSave);
  };
  
  const updatePost = async (postId: string, data: Partial<Post>) => {
      await updateDoc(doc(db, "posts", postId), data);
  }

  const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      text: commentText,
      user: currentUser.name,
      userId: currentUser.id,
      avatar: currentUser.avatar,
      timestamp: Timestamp.now(),
    };
    await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(newComment) });
  };

  const createChat = async (friend: User): Promise<Chat | null> => {
    if (!currentUser) return null;
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.id));
    const snapshot = await getDocs(q);
    const existingChat = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)).find(chat => chat.users.includes(friend.id));
    if (existingChat) return existingChat;
    const newChatRef = doc(collection(db, 'chats'));
    const newChatData: Omit<Chat, 'lastMessageTime'> = {
        id: newChatRef.id, name: friend.name, avatar: friend.avatar, users: [currentUser.id, friend.id],
        userInfo: { [currentUser.id]: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }, [friend.id]: { id: friend.id, name: friend.name, avatar: friend.avatar } },
        lastMessageTimestamp: serverTimestamp() as any, lastMessageText: `Conversation started`, unreadCount: { [currentUser.id]: 0, [friend.id]: 0 }, isMuted: false, isBlocked: false,
    };
    await setDoc(newChatRef, newChatData);
    return { ...newChatData, lastMessageTime: 'Just now' } as Chat;
  };

  const unfriendUser = async (friendId: string) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friends: arrayRemove(friendId) });
    batch.update(doc(db, 'users', friendId), { friends: arrayRemove(currentUser.id) });
    await batch.commit();
  };

  const addMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'time'>) => {
    if (!currentUser) return;
    const chatRef = doc(db, 'chats', chatId);
    await addDoc(collection(chatRef, 'messages'), { ...messageData, timestamp: serverTimestamp() });
    const chatDoc = await getDoc(chatRef);
    if(chatDoc.exists()) {
        const otherUserId = (chatDoc.data() as Chat).users.find(id => id !== currentUser.id);
        if (otherUserId) {
             const unreadCountField = `unreadCount.${otherUserId}`;
             await updateDoc(chatRef, { lastMessageTimestamp: serverTimestamp(), lastMessageText: getMessageDescription(messageData as Message), [unreadCountField]: increment(1) });
        }
    }
  };

  const deleteMessage = async (chatId: string, messageId: string) => await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
  const updateMessage = async (chatId: string, messageId: string, updated: Partial<Message>) => await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), updated);
  
  const createNotification = async (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      await addDoc(collection(db, `users/${userId}/notifications`), { ...notification, timestamp: serverTimestamp(), isRead: false });
  };

  const sendFriendRequest = async (targetUser: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friendRequestsSent: arrayUnion(targetUser.id) });
    batch.update(doc(db, 'users', targetUser.id), { friendRequestsReceived: arrayUnion(currentUser.id) });
    await batch.commit();
    createNotification(targetUser.id, { type: 'friend_request', message: `<strong>${currentUser.name}</strong> sent you a friend request.`, fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar}, link: `/contact` });
  };

  const acceptFriendRequest = async (requestingUser: User) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', currentUser.id), { friends: arrayUnion(requestingUser.id), friendRequestsReceived: arrayRemove(requestingUser.id) });
    batch.update(doc(db, 'users', requestingUser.id), { friends: arrayUnion(currentUser.id), friendRequestsSent: arrayRemove(currentUser.id) });
    await batch.commit();
  };

  const declineFriendRequest = async (requestingUser: User) => {
      if (!currentUser) return;
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', currentUser.id), { friendRequestsReceived: arrayRemove(requestingUser.id) });
      batch.update(doc(db, 'users', requestingUser.id), { friendRequestsSent: arrayRemove(currentUser.id) });
      await batch.commit();
  };
  
  const markNotificationsAsRead = async () => {
    if (!currentUser || unreadNotificationCount === 0) return;
    const q = query(collection(db, `users/${currentUser.id}/notifications`), where("isRead", "==", false));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();
  };
  
  const deleteNotifications = async (notificationIds: string[]) => {
    if (!currentUser || notificationIds.length === 0) return;
    const batch = writeBatch(db);
    notificationIds.forEach(id => batch.delete(doc(db, `users/${currentUser.id}/notifications`, id)));
    await batch.commit();
  };

  const addMissedCall = async (user: User) => {
      if(!currentUser) return;
      await addDoc(collection(db, `users/${currentUser.id}/calls`), { user: user.name, userId: user.id, avatar: user.avatar, type: 'missed', timestamp: serverTimestamp() });
  }

  const initiateCall = (user: User, type: 'audio' | 'video') => {
      if (callState.status !== 'idle') return;
      setCallState({ status: 'outgoing', user, type });
      setTimeout(() => setCallState(prev => prev.status === 'outgoing' ? { ...prev, status: 'connected' } : prev), 3000);
  };

  const answerCall = () => setCallState(prev => prev.status === 'incoming' ? { ...prev, status: 'connected' } : prev);
  const endCall = () => setCallState({ status: 'idle' });
  
  const readChatAloud = useCallback(async () => {
    if (isReadingAloud) { if (ttsAudioRef.current) ttsAudioRef.current.pause(); setIsReadingAloud(false); return; }
    if (!selectedChatId) return;
    setIsReadingAloud(true);
    try {
        const q = query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const text = snapshot.docs.reverse().map(d => `${d.data().user}: ${getMessageDescription(d.data() as Message)}`).join('\n');
        const { audioUrl } = await textToSpeech({ text });
        ttsAudioRef.current = new Audio(audioUrl);
        ttsAudioRef.current.play();
        ttsAudioRef.current.onended = () => setIsReadingAloud(false);
    } catch (error) { setIsReadingAloud(false); throw error; }
  }, [isReadingAloud, selectedChatId]);

  const fetchSmartReplies = useCallback(async () => {
    if (!selectedChatId) return;
    try {
        const q = query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const history = snapshot.docs.reverse().map(d => getMessageDescription(d.data() as Message)).join('\n');
        const res = await smartReplySuggestions({ history });
        setSmartReplies(res.suggestions);
    } catch (error) { console.error(error); }
  }, [selectedChatId]);

  const clearSmartReplies = useCallback(() => setSmartReplies([]), []);

  const updateUserProfile = async (data: Partial<User>, files?: { avatar?: File | string }) => {
    if (!auth.currentUser || !currentUser) throw new Error("Not authenticated");
    const updateData: { [key: string]: any } = { ...data };
    if (files?.avatar) {
        const avatarRef = ref(getStorage(), `avatars/${auth.currentUser.uid}/${Date.now()}.png`);
        let blob: Blob;
        if (typeof files.avatar === 'string') blob = await (await fetch(files.avatar)).blob();
        else blob = files.avatar;
        await uploadBytes(avatarRef, blob);
        const url = await getDownloadURL(avatarRef);
        updateData.avatar = url;
        await updateProfile(auth.currentUser, { photoURL: url });
    }
    if (data.name) await updateProfile(auth.currentUser, { displayName: data.name });
    await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);
  };
    
  return (
    <AppContext.Provider value={{
        currentUser, updateUserProfile, posts, addPost, updatePost, deletePost, addComment, editingPost, startEditPost, cancelEditPost,
        calls, settings, setSettings, chats, setChats, selectedChatId, setSelectedChatId, activeTab, setActiveTab, initialContactTab, setInitialContactTab,
        addMessage, deleteMessage, updateMessage, users, friends, suggestedUsers, friendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest,
        createChat, unfriendUser, callState, initiateCall, answerCall, endCall, addMissedCall, notifications, unreadNotificationCount, markNotificationsAsRead,
        createNotification, deleteNotifications, readChatAloud, isReadingAloud, smartReplies, fetchSmartReplies, clearSmartReplies
    }}>
        {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};
