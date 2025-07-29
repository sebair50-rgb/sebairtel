
"use client";

import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatView from './ChatView';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

const ChatInterface = () => {
  const { chats } = useAppContext();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Automatically select the first chat on desktop if none is selected
  React.useEffect(() => {
    if (window.innerWidth >= 768 && !selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);
  
  return (
    <div className="flex h-full w-full border-t md:border-t-0 md:border rounded-lg overflow-hidden">
      <div
        className={cn(
          "bg-card border-l transition-transform duration-300 ease-in-out md:flex md:flex-col md:w-80 lg:w-96",
          selectedChatId !== null ? "w-0 -translate-x-full md:w-80 lg:w-96 md:translate-x-0" : "w-full translate-x-0"
        )}
      >
        <ChatList
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
        />
      </div>
      <div className={cn(
          "flex-1 flex-col transition-transform duration-300 ease-in-out",
          selectedChatId !== null ? "w-full flex translate-x-0" : "w-0 -translate-x-full hidden md:flex"
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
