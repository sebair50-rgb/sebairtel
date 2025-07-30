
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import type { User, Post, Call, Chat, Message, CallState, Notification } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch, increment, limit
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { smartReplySuggestions } from '@/ai/flows/smart-reply';

interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    notifications: {
        all: boolean;
        messages: boolean;
        mentions: boolean;
        calls: boolean;
    };
    privacy: boolean;
}

interface AppContextType {
  currentUser: User | null;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  posts: Post[];
  addPost: (post: Pick<Post, 'content' | 'media'>) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  calls: Call[];
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'time'>) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => Promise<void>;
  users: User[];
  friends: User[];
  suggestedUsers: User[];
  createChat: (friend: User) => Promise<Chat | null>;
  callState: CallState;
  initiateCall: (user: User, type: 'audio' | 'video') => void;
  answerCall: () => void;
  endCall: () => void;
  addMissedCall: (user: User) => void;
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  createNotification: (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  fetchSmartReplies: () => Promise<void>;
  smartReplies: string[];
  clearSmartReplies: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
    theme: 'system',
    notifications: {
        all: true,
        messages: true,
        mentions: true,
        calls: true,
    },
    privacy: false,
};

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState('contact');
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('app-settings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }
    return defaultSettings;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

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

  const markChatAsRead = useCallback(async (chatId: string) => {
    if (!authUser) return;
    const chatRef = doc(db, 'chats', chatId);
    const fieldName = `unreadCount.${authUser.uid}`;
    
    // Check if document exists before updating
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      await updateDoc(chatRef, { [fieldName]: 0 });
    }
  }, [authUser]);


  useEffect(() => {
    if (selectedChatId) {
        markChatAsRead(selectedChatId);
        clearSmartReplies();
    }
  }, [selectedChatId, markChatAsRead]);


  useEffect(() => {
    document.documentElement.className = 'light';
  }, []);

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
            setCurrentUser({ id: doc.id, ...doc.data() } as User);
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
              time: data.timestamp?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) || '',
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
                 // Fallback to fetch user if not in userInfo
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
                 name: otherUserInfo ? otherUserInfo.name : "مستخدم محذوف",
                 avatar: otherUserInfo ? otherUserInfo.avatar : "?",
                 lastMessageText: data.lastMessageText || '...',
                 lastMessageTime: data.lastMessageTimestamp?.toDate().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }) || '',
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
                time: data.timestamp?.toDate().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) || ''
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
            return `أرسل صورة ${msg.text ? `- مع تعليق: ${msg.text}` : ''}`;
        case 'video':
            return `أرسل فيديو ${msg.text ? `- مع تعليق: ${msg.text}` : ''}`;
        case 'audio':
            return 'أرسل رسالة صوتية';
        case 'file':
             return `أرسل ملفًا باسم '${msg.fileInfo?.name || 'ملف'}' ${msg.text ? `- مع تعليق: ${msg.text}` : ''}`;
        case 'code':
            const codeMatch = msg.text?.match(/```(\w+)/);
            const lang = codeMatch ? ` من نوع ${codeMatch[1]}` : '';
            return `أرسل مقطعًا برمجيًا${lang}`;
        default:
            return 'أرسل رسالة';
    }
  };

  const addPost = async (postData: Pick<Post, 'content' | 'media'>) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'posts'), {
        ...postData,
        user: currentUser.name,
        userId: currentUser.id,
        avatar: currentUser.avatar,
        likedBy: [],
        comments: [],
        timestamp: serverTimestamp(),
    });
  };
  
  const updatePost = async (postId: string, data: Partial<Post>) => {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, data);
  }

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
        lastMessageText: `لقد بدأت محادثة مع ${friend.name}`,
        unreadCount: { [currentUser.id]: 0, [friend.id]: 0 },
        isMuted: false,
        isBlocked: false,
    };

    await setDoc(newChatRef, newChatData);

    await createNotification(friend.id, {
        type: 'new_friend',
        message: `بدأ ${currentUser.name} محادثة معك.`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        link: `/chats/${newChatRef.id}`
    });

    const createdChatForState: Chat = {
        ...newChatData,
        lastMessageTime: new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }),
    };
    
    setChats(prevChats => [createdChatForState, ...prevChats].sort((a,b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0)));
    
    return createdChatForState;
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

    // Handle unread counts and notifications
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
                message: `لديك رسالة جديدة من <strong>${currentUser.name}</strong>`,
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
      if (!settings.notifications.all) return;
      const userNotificationsRef = collection(db, `users/${userId}/notifications`);
      await addDoc(userNotificationsRef, {
          ...notification,
          timestamp: serverTimestamp(),
          isRead: false,
      });
  };
  
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
          message: `لديك مكالمة فائتة من ${user.name}.`,
          fromUser: {id: user.id, name: user.name, avatar: user.avatar},
          link: `/calls`
      });
  }

  const initiateCall = (user: User, type: 'audio' | 'video') => {
      if (callState.status !== 'idle') return;
      setCallState({ status: 'outgoing', user, type });
      addCallLog(user, 'outgoing');

      setTimeout(() => {
          setCallState(prev => {
              if (prev.status === 'outgoing') {
                  return { ...prev, status: 'connected' };
              }
              return prev;
          })
      }, 3000);
      setTimeout(() => {
          setCallState(prev => {
              if (prev.status === 'connected') {
                  endCall();
              }
              return prev;
          })
      }, 8000);
  };

  const answerCall = () => {
      if (callState.status === 'incoming') {
          setCallState({ ...callState, status: 'connected' });
      }
  };

  const endCall = () => {
      setCallState({ status: 'idle' });
  };

    const updateUserProfile = async (data: Partial<User>) => {
        if (!auth.currentUser) throw new Error("Not authenticated");

        const updateData: { [key: string]: any } = {};

        if (data.name && data.name !== auth.currentUser.displayName) {
            await updateProfile(auth.currentUser, { displayName: data.name });
            updateData.name = data.name;
            updateData.avatar = data.name.charAt(0).toUpperCase();
        }

        if (Object.keys(updateData).length > 0) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, updateData);
        }
    };
    
    const fetchSmartReplies = async () => {
        if (!selectedChatId) return;

        const messagesRef = collection(db, 'chats', selectedChatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const history = snapshot.docs.map(doc => {
            const msg = doc.data();
            return `${msg.user}: ${msg.text || '[attachment]'}`;
        }).reverse().join('\n');
        
        try {
            const response = await smartReplySuggestions({ history });
            setSmartReplies(response.suggestions);
        } catch (error) {
            console.error("Failed to fetch smart replies", error);
            setSmartReplies([]);
        }
    }

    const clearSmartReplies = () => {
        setSmartReplies([]);
    }

  const value = {
    currentUser,
    updateUserProfile,
    posts,
    addPost,
    updatePost,
    calls,
    settings,
    setSettings,
    chats,
    setChats,
    selectedChatId,
    setSelectedChatId,
    activeTab,
    setActiveTab,
    addMessage,
    deleteMessage,
    updateMessage,
    users,
    friends,
    suggestedUsers,
    createChat,
    callState,
    initiateCall,
    answerCall,
    endCall,
    addMissedCall,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
    createNotification,
    fetchSmartReplies,
    smartReplies,
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
