

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Post, Notification, Call, Chat, Message } from '@/lib/types';
import { initialUsers, initialPosts, initialNotifications, initialFriendRequests, CURRENT_USER, initialCalls, initialChats } from '@/lib/data';
import { useAuth } from './AuthContext';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  friendRequests: User[];
  setFriendRequests: React.Dispatch<React.SetStateAction<User[]>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  addMessage: (chatId: number, message: Message) => void;
  deleteMessage: (chatId: number, messageId: number) => void;
  updateMessage: (chatId: number, messageId: number, updatedMessage: Message) => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (post: Pick<Post, 'content' | 'media'>) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  calls: Call[];
  setCalls: React.Dispatch<React.SetStateAction<Call[]>>;
  settings: { notifications: boolean; privacy: boolean };
  setSettings: React.Dispatch<React.SetStateAction<{ notifications: boolean; privacy: boolean; }>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);

  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: 100, // This might need to come from your DB for the authUser
        name: authUser.displayName || 'أنت',
        avatar: '👤', // Default avatar, or get from user profile
      });
    }
  }, [authUser]);


  const [darkMode, setDarkMode] = useState(true);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [friendRequests, setFriendRequests] = useState<User[]>(initialFriendRequests);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [settings, setSettings] = useState({ notifications: true, privacy: false });

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

  const addMessage = (chatId: number, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
      )
    );
  };

  const deleteMessage = (chatId: number, messageId: number) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: chat.messages.filter(m => m.id !== messageId) }
          : chat
      )
    );
  };
  
  const updateMessage = (chatId: number, messageId: number, updatedMessage: Message) => {
      setChats(prevChats =>
          prevChats.map(chat =>
              chat.id === chatId
                  ? { ...chat, messages: chat.messages.map(m => m.id === messageId ? updatedMessage : m) }
                  : chat
          )
      );
  };


  const addPost = (postData: Pick<Post, 'content' | 'media'>) => {
    const newPost: Post = {
        id: Date.now(),
        user: currentUser.name,
        avatar: currentUser.avatar,
        time: 'الآن',
        likes: 0,
        isLiked: false,
        isSaved: false,
        comments: [],
        ...postData,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }

  const value = {
    darkMode,
    toggleDarkMode,
    currentUser,
    users,
    setUsers,
    friendRequests,
    setFriendRequests,
    chats,
    setChats,
    addMessage,
    deleteMessage,
    updateMessage,
    posts,
    setPosts,
    addPost,
    notifications,
    setNotifications,
    calls,
    setCalls,
    settings,
    setSettings,
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
