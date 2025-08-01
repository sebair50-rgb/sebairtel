
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import type { User, Post, Call, Chat, Message, CallState, Notification, Comment, Reaction } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch, increment, limit, arrayUnion, Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from 'firebase/auth';
import { textToSpeech, TextToSpeechInput } from '@/ai/flows/tts-flow';
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
  updateUserProfile: (data: Partial<Omit<User, 'id'>>, files?: { avatar?: File, cv?: File }) => Promise<void>;
  posts: Post[];
  addPost: (post: { content: string, mediaType?: 'image' | 'video', mediaSrc?: string }) => Promise<void>;
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
  initialContactTab: 'chats' | 'friends';
  setInitialContactTab: (tab: 'chats' | 'friends') => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'time'>) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => Promise<void>;
  users: User[];
  friends: User[];
  suggestedUsers: User[];
  setSuggestedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  sendFriendRequest: (friend: User) => Promise<void>;
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
  const [initialContactTab, setInitialContactTab] = useState<'chats' | 'friends'>('friends');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // States for AI features
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  
  // State for post editing
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const startEditPost = (post: Post) => {
    setEditingPost(post);
  };
  const cancelEditPost = () => {
    setEditingPost(null);
  };


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
        
        // Handle theme
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
      // Sync language context when app settings change
      if (settings.language) {
          setLanguage(settings.language);
      }
  }, [settings.language, setLanguage]);

  const markChatAsRead = useCallback(async (chatId: string) => {
    if (!authUser) return;
    const chatRef = doc(db, 'chats', chatId);
    const fieldName = `unreadCount.${authUser.uid}`;
    
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      await updateDoc(chatRef, { [fieldName]: 0 });
    }
  }, [authUser]);


  useEffect(() => {
    if (selectedChatId) {
        markChatAsRead(selectedChatId);
        clearSmartReplies(); // Clear replies when chat changes
    }
  }, [selectedChatId, markChatAsRead]);


  // Presence management effect
  useEffect(() => {
    if (!authUser) return;

    const userStatusRef = doc(db, 'users', authUser.uid);
    
    // Set online status
    updateDoc(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
    });

    const handleBeforeUnload = () => {
        updateDoc(userStatusRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
        });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Set offline on unmount/logout
        updateDoc(userStatusRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
        });
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
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            const userData = doc.data() as User;
            setCurrentUser({ id: doc.id, ...userData });
            // Load user-specific settings from Firestore
            if (userData.settings) {
                 setSettings(prevSettings => ({
                    ...defaultSettings,
                    ...userData.settings,
                    notifications: { ...defaultSettings.notifications, ...userData.settings.notifications },
                    privacy: { ...defaultSettings.privacy, ...userData.settings.privacy },
                    sounds: { ...defaultSettings.sounds, ...userData.settings.sounds },
                    interface: { ...defaultSettings.interface, ...userData.settings.interface },
                }));
            }
        }
    });
    
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        const otherUsers = allUsers.filter(u => u.id !== authUser.uid);
        setUsers(otherUsers);
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
             } else {
                 if (otherUserId) {
                     const userDoc = await getDoc(doc(db, 'users', otherUserId));
                     if (userDoc.exists()) {
                        otherUserInfo = { id: userDoc.id, ...userDoc.data() };
                     }
                 }
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
            const sortedChats = chatsData.sort((a, b) => {
                const timeA = a.lastMessageTimestamp?.toMillis() || 0;
                const timeB = b.lastMessageTimestamp?.toMillis() || 0;
                return timeB - timeA;
            });
            setChats(sortedChats);
        });

    }, (error) => {
        console.error("Firestore chats listener error:", error);
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
        const unreadCount = notificationsData.filter(n => !n.isRead).length;
        setUnreadNotificationCount(unreadCount);
    });


    return () => {
      unsubscribeUser();
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeChats();
      unsubscribeCalls();
      unsubscribeNotifications();
    };
  }, [authUser, authLoading]);

  // Persist settings to Firestore whenever they change
  useEffect(() => {
    const saveSettings = async () => {
        if (!authUser || authLoading) return;
        // Avoid saving default settings on initial load before user settings are fetched
        if (currentUser && !currentUser.settings && JSON.stringify(settings) === JSON.stringify(defaultSettings)) {
             return;
        }
        
        const userDocRef = doc(db, 'users', authUser.uid);
        await updateDoc(userDocRef, { settings: settings });
    };
    
    // Debounce saving settings
    const handler = setTimeout(() => {
        saveSettings();
    }, 1000);

    return () => {
        clearTimeout(handler);
    };

  }, [settings, authUser, authLoading, currentUser]);


  useEffect(() => {
      if (!currentUser || users.length === 0) return;

      const chatPartnerIds = new Set(
          chats.flatMap(chat => chat.users).filter(userId => userId !== currentUser.id)
      );

      const friendsList: User[] = [];
      const suggestionsList: User[] = [];

      users.forEach(user => {
          if (chatPartnerIds.has(user.id)) {
              friendsList.push(user);
          } else {
              suggestionsList.push(user);
          }
      });
      
      setFriends(friendsList);
      setSuggestedUsers(suggestionsList);

  }, [users, chats, currentUser]);
  
  const getMessageDescription = (msg: Message): string => {
    switch (msg.type) {
        case 'text':
            return msg.text || '';
        case 'image':
            return `Sent an image ${msg.text ? `- with caption: ${msg.text}` : ''}`;
        case 'video':
            return `Sent a video ${msg.text ? `- with caption: ${msg.text}` : ''}`;
        case 'audio':
            return 'Sent a voice message';
        case 'file':
             return `Sent a file named '${msg.fileInfo?.name || 'file'}' ${msg.text ? `- with caption: ${msg.text}` : ''}`;
        case 'code':
            const codeMatch = msg.text?.match(/```(\w+)/);
            const lang = codeMatch ? ` of type ${codeMatch[1]}` : '';
            return `Sent a code snippet${lang}`;
        default:
            return 'Sent a message';
    }
  };

  const addPost = async (postData: { content: string, mediaType?: 'image' | 'video', mediaSrc?: string }) => {
    if (!currentUser) return;
    
    const dataToSave: any = {
      content: postData.content,
      user: currentUser.name,
      userId: currentUser.id,
      avatar: currentUser.avatar,
      reactions: [],
      comments: [],
      timestamp: serverTimestamp(),
      mediaType: postData.mediaType || null,
      mediaSrc: postData.mediaSrc || null,
    };

    if (dataToSave.mediaSrc && dataToSave.mediaSrc.length > 1048487) {
        throw new Error("File size exceeds 1MB limit.");
    }

    await addDoc(collection(db, 'posts'), dataToSave);
  };
  
  const updatePost = async (postId: string, data: Partial<Post>) => {
      const postRef = doc(db, "posts", postId);
      const updateData: {[key: string]: any} = {};

      if (data.content !== undefined) updateData.content = data.content;
      if (data.reactions !== undefined) updateData.reactions = data.reactions;
      
      // Handle cases where mediaSrc could be null to remove it.
      if (data.mediaSrc === undefined) { // Check for undefined to distinguish from null
          // Do not update media if it's not provided
      } else {
        updateData.mediaSrc = data.mediaSrc;
        updateData.mediaType = data.mediaType;
      }
      
      await updateDoc(postRef, updateData);
  }

  const deletePost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      text: commentText,
      user: currentUser.name,
      userId: currentUser.id,
      avatar: currentUser.avatar,
      timestamp: Timestamp.now(), // Use client-side timestamp
    };

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });
  };

  const createChat = async (friend: User): Promise<Chat | null> => {
    if (!currentUser) return null;

    const existingChatQuery = query(
      collection(db, 'chats'), 
      where('users', 'array-contains', currentUser.id)
    );
    const querySnapshot = await getDocs(existingChatQuery);
    const existingChat = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Chat))
      .find(chat => chat.users.includes(friend.id));

    if (existingChat) {
      return existingChat;
    }

    const newChatRef = doc(collection(db, 'chats'));
    const newChatData: Omit<Chat, 'lastMessageTime'> = {
        id: newChatRef.id,
        name: friend.name,
        avatar: friend.avatar,
        users: [currentUser.id, friend.id],
        userInfo: {
            [currentUser.id]: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
            [friend.id]: { id: friend.id, name: friend.name, avatar: friend.avatar }
        },
        lastMessageTimestamp: serverTimestamp() as any,
        lastMessageText: `You started a conversation with ${friend.name}`,
        unreadCount: { [currentUser.id]: 0, [friend.id]: 0 },
        isMuted: false,
        isBlocked: false,
    };

    await setDoc(newChatRef, newChatData);

    await createNotification(friend.id, {
        type: 'new_friend',
        message: `${currentUser.name} started a conversation with you.`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        link: `/chats/${newChatRef.id}`
    });

    const createdChatForState: Chat = {
        ...newChatData,
        lastMessageTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
    };
    
    setChats(prevChats => [createdChatForState, ...prevChats].sort((a,b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0)));
    
    return createdChatForState;
};

    const unfriendUser = async (friendId: string) => {
        if (!currentUser) return;
        
        // Find the chat document where the 'users' array contains both UIDs
        const q = query(
            collection(db, 'chats'),
            where('users', 'array-contains', currentUser.id)
        );
        const querySnapshot = await getDocs(q);
        const chatDoc = querySnapshot.docs.find(doc => doc.data().users.includes(friendId));

        if (chatDoc) {
            await deleteDoc(doc(db, 'chats', chatDoc.id));
            setChats(prev => prev.filter(c => c.id !== chatDoc.id));
        } else {
             console.warn("No chat found to delete between these users.");
        }
    };

  const addMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'time'>) => {
    if (!currentUser || !settings.notifications.all || !settings.notifications.messages) return;
    const chatRef = doc(db, 'chats', chatId);
    const messagesColRef = collection(chatRef, 'messages');
    
    const dataToSend: any = {
        ...messageData,
        timestamp: serverTimestamp(),
    };
    
    await addDoc(messagesColRef, dataToSend);

    let lastMessageText = getMessageDescription(messageData as Message);

    const chatDoc = await getDoc(chatRef);
    if(chatDoc.exists()) {
        const chatData = chatDoc.data() as Chat;
        const otherUserId = chatData.users.find(id => id !== currentUser.id);

        if (otherUserId) {
             const unreadCountField = `unreadCount.${otherUserId}`;
             await updateDoc(chatRef, {
                lastMessageTimestamp: serverTimestamp(),
                lastMessageText: lastMessageText,
                [unreadCountField]: increment(1)
            });

            await createNotification(otherUserId, {
                type: 'new_message',
                message: `You have a new message from <strong>${currentUser.name}</strong>`,
                fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
                link: `/chats/${chatId}`
            });
        }
    }
  };
  

  const deleteMessage = async (chatId: string, messageId: string) => {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(msgRef);
  };
  
  const updateMessage = async (chatId: string, messageId: string, updatedMessage: Partial<Message>) => {
       const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
       await updateDoc(msgRef, updatedMessage);
  }
  
  const createNotification = async (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
          const userData = userDoc.data();
          const userSettings = userData.settings as AppSettings | undefined;

          // Only send notification if the user has them enabled
          if (userSettings?.notifications?.all) {
              const userNotificationsRef = collection(db, `users/${userId}/notifications`);
              await addDoc(userNotificationsRef, {
                  ...notification,
                  timestamp: serverTimestamp(),
                  isRead: false,
              });
          }
      }
  };

  const sendFriendRequest = async (friend: User) => {
    if (!currentUser) return;
    // Create a notification for the other user
    await createNotification(friend.id, {
        type: 'friend_request',
        message: `<strong>${currentUser.name}</strong> sent you a friend request.`,
        fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
        link: `/users` // or a dedicated friend requests page
    });

    // Update the state of the suggested user to show "Request Sent"
    setSuggestedUsers(prev => prev.map(u => u.id === friend.id ? {...u, requestSent: true} : u));
  }
  
  const markNotificationsAsRead = async () => {
    if (!currentUser || unreadNotificationCount === 0) return;
    const notificationsRef = collection(db, `users/${currentUser.id}/notifications`);
    const q = query(notificationsRef, where("isRead", "==", false));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  };
  
    const deleteNotifications = async (notificationIds: string[]) => {
        if (!currentUser || notificationIds.length === 0) return;
        const batch = writeBatch(db);
        notificationIds.forEach(id => {
            const notificationRef = doc(db, `users/${currentUser.id}/notifications`, id);
            batch.delete(notificationRef);
        });
        await batch.commit();
    };


  const addCallLog = async (user: User, type: 'outgoing' | 'incoming' | 'missed', duration?: string) => {
    if(!currentUser) return;
    
    const callData: Omit<Call, 'id' | 'time'> = {
        user: user.name,
        avatar: user.avatar,
        type: type,
        timestamp: serverTimestamp() as any,
        duration: duration || '0:00'
    };
    await addDoc(collection(db, `users/${currentUser.id}/calls`), callData);

    if (type !== 'missed') {
        const otherUserCallType = type === 'outgoing' ? 'incoming' : 'outgoing';
        const otherUserCallData: Omit<Call, 'id'| 'time'> = {
            user: currentUser.name,
            avatar: currentUser.avatar,
            type: otherUserCallType,
            timestamp: serverTimestamp() as any,
            duration: duration || '0:00'
        };
        await addDoc(collection(db, `users/${user.id}/calls`), otherUserCallData);
    }
  }

  const addMissedCall = async (user: User) => {
      if(!currentUser || !settings.notifications.all || !settings.notifications.calls) return;
      await addCallLog(user, 'missed');
      await createNotification(currentUser.id, {
          type: 'missed_call',
          message: `You have a missed call from ${user.name}.`,
          fromUser: {id: user.id, name: user.name, avatar: user.avatar},
          link: `/calls`
      });
  }

  const playRingingSound = () => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    // Note: The /ringing.mp3 file needs to be in the `public` directory.
    audioRef.current = new Audio('/ringing.mp3');
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.error("Error playing sound:", e));
  };

  const stopRingingSound = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
  };

  const initiateCall = (user: User, type: 'audio' | 'video') => {
      if (callState.status !== 'idle') return;
      
      setCallState({ status: 'outgoing', user, type });
      addCallLog(user, 'outgoing');
      playRingingSound();

      // Simulate call connection or timeout
      const callTimeout = setTimeout(() => {
          setCallState(prev => {
              if (prev.status === 'outgoing') {
                  stopRingingSound();
                  // Simulate that the other user didn't answer
                  addMissedCall(user);
                  return { status: 'idle' };
              }
              return prev;
          });
      }, 15000); // 15 seconds timeout

      // Temporary timeout to simulate connection
      setTimeout(() => {
          setCallState(prev => {
              if (prev.status === 'outgoing') {
                  stopRingingSound();
                  clearTimeout(callTimeout);
                  return { ...prev, status: 'connected' };
              }
              return prev;
          })
      }, 5000);
  };

  const answerCall = () => {
      if (callState.status === 'incoming') {
          stopRingingSound();
          setCallState({ ...callState, status: 'connected' });
      }
  };

  const endCall = () => {
      stopRingingSound();
      if(callState.status === 'incoming' && callState.user) {
          addMissedCall(callState.user);
      }
      setCallState({ status: 'idle' });
  };
  
    // AI Feature: Read Chat Aloud
    const readChatAloud = useCallback(async () => {
        if (isReadingAloud) {
            // Stop playing
            if (ttsAudioRef.current) {
                ttsAudioRef.current.pause();
                ttsAudioRef.current = null;
            }
            setIsReadingAloud(false);
            return;
        }

        if (!selectedChatId) return;
        
        setIsReadingAloud(true);
        try {
            const messagesColRef = collection(db, 'chats', selectedChatId, 'messages');
            const q = query(messagesColRef, orderBy('timestamp', 'desc'), limit(10));
            const snapshot = await getDocs(q);
            const messages = snapshot.docs.map(doc => doc.data() as Message);
            
            if (messages.length === 0) {
                 throw new Error("No messages to read.");
            }

            const chatText = messages.reverse().map(m => `${m.user}: ${getMessageDescription(m)}`).join('\n');
            const { audioUrl } = await textToSpeech({ text: chatText });

            ttsAudioRef.current = new Audio(audioUrl);
            ttsAudioRef.current.play();
            ttsAudioRef.current.onended = () => {
                setIsReadingAloud(false);
            };

        } catch (error) {
            console.error("TTS failed:", error);
            setIsReadingAloud(false);
            throw error;
        }
    }, [isReadingAloud, selectedChatId]);

     // AI Feature: Fetch Smart Replies
    const fetchSmartReplies = useCallback(async () => {
        if (!selectedChatId) return;

        try {
            const messagesColRef = collection(db, 'chats', selectedChatId, 'messages');
            const q = query(messagesColRef, orderBy('timestamp', 'desc'), limit(5));
            const snapshot = await getDocs(q);
            const messages = snapshot.docs.map(doc => doc.data() as Message);
             if (messages.length === 0) {
                setSmartReplies([]);
                return;
            }

            const history = messages.reverse().map(m => `${m.user}: ${getMessageDescription(m)}`).join('\n');
            const response = await smartReplySuggestions({ history });
            setSmartReplies(response.suggestions);

        } catch (error) {
            console.error("Failed to fetch smart replies:", error);
            throw error;
        }
    }, [selectedChatId]);

    const clearSmartReplies = useCallback(() => {
        setSmartReplies([]);
    }, []);

    const updateUserProfile = async (data: Partial<Omit<User, 'id'>>, files?: { avatar?: File, cv?: File }) => {
        if (!auth.currentUser) throw new Error("Not authenticated");
        
        const updateData: { [key: string]: any } = { ...data };
        const storage = getStorage();

        if (files?.avatar) {
            const avatarRef = ref(storage, `avatars/${auth.currentUser.uid}/${files.avatar.name}`);
            const snapshot = await uploadBytes(avatarRef, files.avatar);
            const downloadURL = await getDownloadURL(snapshot.ref);
            updateData.avatar = downloadURL;
        }

        if (files?.cv) {
            const cvRef = ref(storage, `cvs/${auth.currentUser.uid}/${files.cv.name}`);
            const snapshot = await uploadBytes(cvRef, files.cv);
            updateData.cvUrl = await getDownloadURL(snapshot.ref);
            // cvFileName is already in the `data` object
        }

        if (data.name && data.name !== currentUser?.name) {
            await updateProfile(auth.currentUser, { displayName: data.name });
        }
        
        if (Object.keys(updateData).length > 0) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, updateData);
        }
    };
    
  const value = {
    currentUser,
    updateUserProfile,
    posts,
    addPost,
    updatePost,
    deletePost,
    addComment,
    editingPost,
    startEditPost,
    cancelEditPost,
    calls,
    settings,
    setSettings,
    chats,
    setChats,
    selectedChatId,
    setSelectedChatId,
    activeTab,
    setActiveTab,
    initialContactTab,
    setInitialContactTab,
    addMessage,
    deleteMessage,
    updateMessage,
    users,
    friends,
    suggestedUsers,
    setSuggestedUsers,
    sendFriendRequest,
    createChat,
    unfriendUser,
    callState,
    initiateCall,
    answerCall,
    endCall,
    addMissedCall,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
    createNotification,
    deleteNotifications,
    readChatAloud,
    isReadingAloud,
    smartReplies,
    fetchSmartReplies,
    clearSmartReplies,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
