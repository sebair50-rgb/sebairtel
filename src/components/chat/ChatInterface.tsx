
"use client";

import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatView from './ChatView';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

const ChatInterface = () => {
  const { chats } = useAppContext();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(chats[0]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-full w-full border rounded-lg overflow-hidden">
      <div
        className={cn(
          "bg-card border-l transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-full md:w-80 lg:w-96" : "w-0",
          !selectedChat && "w-full",
          "md:flex flex-col"
        )}
      >
        <ChatList
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      <div className={cn(
          "flex-1 flex-col",
          selectedChat ? "flex" : "hidden md:flex"
      )}>
        {selectedChat ? (
          <ChatView
            key={selectedChat.id}
            chat={selectedChat}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background">
            <MessageSquare size={64} className="mb-4" />
            <h2 className="text-2xl font-bold">حدد محادثة</h2>
            <p>اختر محادثة من القائمة لبدء الدردشة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

