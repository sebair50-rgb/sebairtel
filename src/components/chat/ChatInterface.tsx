
"use client";

import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatView from './ChatView';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import useIsMobile from '@/hooks/use-is-mobile';

const ChatInterface = () => {
  const { chats } = useAppContext();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const selectedChat = chats.find(c => c.id === selectedChatId);

  React.useEffect(() => {
    if (!isMobile && !selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId, isMobile]);
  
  return (
    <div className="flex h-full w-full border-t md:border-t-0 md:border rounded-lg overflow-hidden">
      <div
        className={cn(
          "w-full bg-card border-l transition-transform duration-300 ease-in-out md:w-80 lg:w-96 md:flex md:flex-col",
          isMobile && selectedChatId !== null ? "absolute -translate-x-full" : "relative translate-x-0"
        )}
      >
        <ChatList
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
        />
      </div>
      <div className={cn("flex-1 flex flex-col", isMobile && !selectedChatId ? "hidden" : "flex")}>
        {selectedChat ? (
          <ChatView
            key={selectedChat.id}
            chat={selectedChat}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background">
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
