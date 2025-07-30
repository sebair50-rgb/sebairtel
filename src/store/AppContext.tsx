
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Post, Notification, Call, Chat, Message, CallState } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch 
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  posts: Post[];
  addPost: (post: Pick<Post, 'content' | 'media'>) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  notifications: Notification[];
  calls: Call[];
  settings: { notifications: boolean; privacy: boolean };
  setSettings: React.Dispatch<React.SetStateAction<{ notifications: boolean; privacy: boolean; }>>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('contact');
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState({ notifications: true, privacy: false });

  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  const [callState, setCallState] = useState<CallState>({ status: 'idle' });


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
        const chatsData = snapshot.docs.map(doc => {
             const data = doc.data();
             const otherUserInfo = Object.values(data.userInfo).find((user: any) => user.id !== authUser.uid);

             return {
                 id: doc.id,
                 ...data,
                 name: otherUserInfo ? otherUserInfo.name : "مستخدم محذوف",
                 avatar: otherUserInfo ? otherUserInfo.avatar : "?",
                 lastMessageText: data.lastMessageText || '...',
                 lastMessageTime: data.lastMessageTimestamp?.toDate().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }) || ''
             } as Chat;
        });
        
        const sortedChats = chatsData.sort((a, b) => {
            const timeA = a.lastMessageTimestamp?.toMillis() || 0;
            const timeB = b.lastMessageTimestamp?.toMillis() || 0;
            return timeB - timeA;
        });

        setChats(sortedChats);
    }, (error) => {
        console.error("Firestore chats listener error:", error);
    });
    
    return () => {
      unsubscribeUser();
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeChats();
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

    const existingChat = chats.find(chat => chat.users.includes(friend.id));
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
        unreadCount: 0,
        isMuted: false,
        isBlocked: false,
    };

    await setDoc(newChatRef, newChatData);

    const createdChatForState: Chat = {
        ...newChatData,
        lastMessageTime: new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }),
    };
    
    setChats(prevChats => [createdChatForState, ...prevChats]);
    
    return createdChatForState;
};

  const addMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'time'>) => {
    if (!currentUser) return;
    const chatRef = doc(db, 'chats', chatId);
    const messagesColRef = collection(chatRef, 'messages');
    
    const dataToSend: any = {
        ...messageData,
        timestamp: serverTimestamp(),
    };
    
    await addDoc(messagesColRef, dataToSend);

    await updateDoc(chatRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageText: messageData.text || (messageData.type !== 'text' ? `مرفق ${messageData.type}` : ''),
    });
  };
  

  const deleteMessage = async (chatId: string, messageId: string) => {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(msgRef);
  };
  
  const updateMessage = async (chatId: string, messageId: string, updatedMessage: Partial<Message>) => {
       const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
       await updateDoc(msgRef, updatedMessage);
  }

  // --- Call Management ---
  const initiateCall = (user: User, type: 'audio' | 'video') => {
      if (callState.status !== 'idle') return;
      setCallState({ status: 'outgoing', user, type });

      // Simulate incoming call for demo purposes
      setTimeout(() => {
          setCallState(prev => {
              if (prev.status === 'outgoing') {
                  return { ...prev, status: 'incoming' };
              }
              return prev;
          })
      }, 3000);
  };

  const answerCall = () => {
      if (callState.status === 'incoming') {
          setCallState({ ...callState, status: 'connected' });
      }
  };

  const endCall = () => {
      setCallState({ status: 'idle' });
  };


  const value = {
    currentUser,
    posts,
    addPost,
    updatePost,
    notifications,
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
    endCall
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
