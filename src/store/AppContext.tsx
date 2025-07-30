
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Post, Notification, Call, Chat, Message } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, where, getDocs, setDoc, getDoc, writeBatch 
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  friends: User[];
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
  const { authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('contact');
  
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState({ notifications: true, privacy: false });

  useEffect(() => {
    // On initial load, check if a theme is saved in localStorage.
    // If not, default to 'light'.
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        document.documentElement.className = 'light';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.className = savedTheme;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setCurrentUser(null);
      setUsers([]);
      setPosts([]);
      setChats([]);
      return;
    };

    const userDocRef = doc(db, 'users', authUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() } as User);
        } else {
            // This case should be handled by AuthContext creating the user doc
            console.log("User document doesn't exist yet.");
        }
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
        setChats(chatsData);
    });
    
    return () => {
      unsubscribeUser();
      unsubscribePosts();
      unsubscribeChats();
    };
  }, [authUser, authLoading]);

  // Derived state for friends from chats and all users
  useEffect(() => {
      if (!authUser) return;

      const usersQuery = query(collection(db, 'users'), where('id', '!=', authUser.uid));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const allUsersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(allUsersData);
      });

      return () => unsubscribeUsers();
  }, [authUser]);


  useEffect(() => {
      if (!authUser) return;
      
      const friendIds = new Set(chats.flatMap(chat => chat.users).filter(id => id !== authUser.id));
      
      const currentFriends = users.filter(user => friendIds.has(user.id));
      setFriends(currentFriends);

  }, [chats, users, authUser]);


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
  
  const createChat = async (otherUserId: string): Promise<string | null> => {
      if (!currentUser) return null;
      
      const chatsRef = collection(db, "chats");
      const sortedUsers = [currentUser.id, otherUserId].sort();
      const chatId = sortedUsers.join('_');
      const chatDocRef = doc(chatsRef, chatId);
      const chatDoc = await getDoc(chatDocRef);


      if (chatDoc.exists()) {
          return chatDoc.id;
      }
      
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      if (!otherUserDoc.exists()) {
          console.error("Attempted to create chat with non-existent user:", otherUserId);
          return null;
      }
      const otherUser = otherUserDoc.data() as User;
      
      const newChatData = {
          users: sortedUsers,
          userInfo: {
              [currentUser.id]: {
                  id: currentUser.id,
                  name: currentUser.name,
                  avatar: currentUser.avatar,
              },
              [otherUserId]: {
                  id: otherUser.id,
                  name: otherUser.name,
                  avatar: otherUser.avatar,
              }
          },
          lastMessageTimestamp: serverTimestamp(),
          lastMessageText: `لقد بدأت محادثة مع ${otherUser.name}`,
          unreadCount: 0,
      };
      
      await setDoc(chatDocRef, newChatData);
      
      return chatId;
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      await deleteDoc(msgRef);
  };
  
  const updateMessage = async (chatId: string, messageId: string, updatedMessage: Partial<Message>) => {
       const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
       await updateDoc(msgRef, updatedMessage);
  }

  const value = {
    currentUser,
    users,
    friends,
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
    updateMessage: updateMessage,
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
