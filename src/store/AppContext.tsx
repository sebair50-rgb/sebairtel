
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Chat, Message, User, Post, Notification } from '@/lib/types';
import { initialChats, initialUsers, initialPosts, initialNotifications, initialFriendRequests, CURRENT_USER } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  addMessage: (chatId: number, message: Message) => void;
  deleteMessage: (chatId: number, messageId: number) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  friendRequests: User[];
  setFriendRequests: React.Dispatch<React.SetStateAction<User[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  settings: { notifications: boolean; privacy: boolean };
  setSettings: React.Dispatch<React.SetStateAction<{ notifications: boolean; privacy: boolean; }>>;
  handleShareToChat: (post: Post, chatId: number) => number;
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
  const { toast } = useToast();

  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [friendRequests, setFriendRequests] = useState<User[]>(initialFriendRequests);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
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
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };
  
  const deleteMessage = (chatId: number, messageId: number) => {
    setChats(prevChats =>
        prevChats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    messages: chat.messages.filter(m => m.id !== messageId)
                };
            }
            return chat;
        })
    );
  };

  const handleShareToChat = (post: Post, chatId: number) => {
    const baseMessage = {
       id: Date.now(),
       user: currentUser.name,
       time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
       avatar: currentUser.avatar,
       status: 'sent',
   };
   
   let messageContent = `مشاركة منشور من ${post.user}:\n\n${post.content}`;
   let message: Message;
   
   if (post.media) {
     message = {
       ...baseMessage,
       type: post.media.type,
       src: post.media.src,
       fileInfo: { name: `post_${post.id}.jpg`, type: 'image/jpeg' },
       text: messageContent
     };
   } else {
     message = {
       ...baseMessage,
       type: 'text',
       text: messageContent
     };
   }
   
   addMessage(chatId, message);
   toast({
      title: "تمت المشاركة بنجاح",
      description: `تمت مشاركة المنشور في المحادثة.`,
    });
    return chatId;
  };


  const value = {
    darkMode,
    toggleDarkMode,
    currentUser,
    chats,
    setChats,
    addMessage,
    deleteMessage,
    users,
    setUsers,
    friendRequests,
    setFriendRequests,
    posts,
    setPosts,
    notifications,
    setNotifications,
    settings,
    setSettings,
    handleShareToChat,
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
