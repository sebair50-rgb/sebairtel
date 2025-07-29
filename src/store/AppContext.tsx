
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Post, Notification, Call, Chat, Message } from '@/lib/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, where, getDocs, setDoc, getDoc } from 'firebase/firestore';

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
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'time'>) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => Promise<void>;
  createChat: (otherUserId: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState({ notifications: true, privacy: false });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (authUser) {
      const userDocRef = doc(db, 'users', authUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setCurrentUser({ id: doc.id, ...doc.data() } as User);
        } else {
            const newUser: User = {
                id: authUser.uid,
                name: authUser.displayName || 'مستخدم جديد',
                avatar: '👤',
                email: authUser.email || ''
            };
            setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
        }
      });
      return () => unsubscribe();
    } else {
      setCurrentUser(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch all users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData.filter(u => u.id !== currentUser.id));
    });

    // Fetch posts
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    });

    // Fetch chats
    const chatsQuery = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.id));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                 id: doc.id,
                 ...data,
                 messages: data.messages || [] // Ensure messages is an array
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
        likes: 0,
        comments: [],
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    });
  };
  
  const updatePost = async (postId: string, data: Partial<Post>) => {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, data);
  }

  const addMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'time'>) => {
    const chatRef = doc(db, 'chats', chatId);
    const messagesColRef = collection(chatRef, 'messages');
    
    await addDoc(messagesColRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    });
  };
  
  const createChat = async (otherUserId: string): Promise<string | null> => {
      if (!currentUser) return null;
      
      const chatsRef = collection(db, "chats");
      // Check if a chat already exists
      const q = query(chatsRef, 
        where('users', 'array-contains', currentUser.id)
      );

      const querySnapshot = await getDocs(q);
      const existingChat = querySnapshot.docs.find(doc => doc.data().users.includes(otherUserId));

      if (existingChat) {
          return existingChat.id;
      }
      
      // Create a new chat
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      if (!otherUserDoc.exists()) return null;
      const otherUser = otherUserDoc.data() as User;
      
      const newChatRef = await addDoc(chatsRef, {
          users: [currentUser.id, otherUserId],
          name: otherUser.name, // This should be dynamic based on the other user
          avatar: otherUser.avatar, // Same as name
          messages: [],
          lastMessageTimestamp: serverTimestamp(),
      });
      
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
    setPosts: () => {}, // Remove direct setters
    addPost,
    updatePost,
    notifications,
    calls,
    settings,
    setSettings,
    chats,
    selectedChatId,
    setSelectedChatId,
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
