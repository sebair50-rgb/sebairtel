
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Post, Notification, Call, Chat, Message } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch 
} from 'firebase/firestore';

// Mock current user since auth is removed
const MOCK_USER: User = {
  id: 'mock-user-id-123',
  name: 'المستخدم الحالي',
  avatar: '👤',
  email: 'user@example.com',
};


interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  users: User[];
  friendRequests: User[];
  posts: Post[];
  addPost: (post: Pick<Post, 'content' | 'media'>) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  notifications: Notification[];
  calls: Call[];
  settings: { notifications: boolean; privacy: boolean };
  setSettings: React.Dispatch<React.SetStateAction<{ notifications: boolean; privacy: boolean; }>>;
  chats: Chat[];
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'time'>) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => Promise<void>;
  createChat: (otherUserId: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('contact');
  
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState({ notifications: true, privacy: false });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch all users except current user
    const usersQuery = query(collection(db, 'users'), where('id', '!=', currentUser.id));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    // Fetch posts
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

    // Fetch chats for the current user
    const chatsQuery = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.id));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => {
             const data = doc.data();
             const otherUserId = Object.keys(data.userInfo).find(uid => uid !== currentUser.id);
             return {
                 id: doc.id,
                 ...data,
                 name: otherUserId ? data.userInfo[otherUserId].name : "مستخدم محذوف",
                 avatar: otherUserId ? data.userInfo[otherUserId].avatar : "?",
             } as Chat;
        });
        setChats(chatsData);
    });
    
    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeChats();
    };
  }, [currentUser]);

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

  const addMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'time'>) => {
    if (!currentUser) return;
    const chatRef = doc(db, 'chats', chatId);
    const messagesColRef = collection(chatRef, 'messages');
    
    await addDoc(messagesColRef, {
        ...messageData,
        timestamp: serverTimestamp(),
    });

    await updateDoc(chatRef, {
        lastMessageTimestamp: serverTimestamp(),
        lastMessageText: messageData.text,
    });
  };
  
  const createChat = async (otherUserId: string): Promise<string | null> => {
      if (!currentUser) return null;
      
      const chatsRef = collection(db, "chats");
      const sortedUsers = [currentUser.id, otherUserId].sort();
      const q = query(chatsRef, where('users', '==', sortedUsers));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].id;
      }
      
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      if (!otherUserDoc.exists()) return null;
      const otherUser = otherUserDoc.data() as User;
      
      const newChatData = {
          users: sortedUsers,
          userInfo: {
              [currentUser.id]: {
                  name: currentUser.name,
                  avatar: currentUser.avatar,
              },
              [otherUserId]: {
                  name: otherUser.name,
                  avatar: otherUser.avatar,
              }
          },
          lastMessageTimestamp: serverTimestamp(),
          lastMessageText: '',
          unreadCount: 0,
      };
      
      const newChatRef = await addDoc(chatsRef, newChatData);
      
      return newChatRef.id;
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(msgRef);
  };
  
  const updateMessage = async (chatId: string, messageId: string, updatedMessage: Partial<Message>) => {
       const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
       await updateDoc(msgRef, updatedMessage);
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  const value = {
    darkMode,
    toggleDarkMode,
    currentUser,
    users,
    friendRequests,
    posts,
    addPost,
    updatePost,
    notifications,
    calls,
    settings,
    setSettings,
    chats,
    selectedChatId,
    setSelectedChatId,
    activeTab,
    setActiveTab,
    addMessage,
    deleteMessage,
    updateMessage,
    createChat,
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
