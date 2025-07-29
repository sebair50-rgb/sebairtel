
"use client";

import React, { useEffect } from 'react';
import ChatList from './ChatList';
import ChatView from './ChatView';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import useIsMobile from '@/hooks/use-is-mobile';

const ChatInterface = () => {
  const { chats, selectedChatId, setSelectedChatId } = useAppContext();
  const isMobile = useIsMobile();

  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    // On desktop, if no chat is selected, select the first one.
    // On mobile, do not auto-select a chat to show the list first.
    if (!isMobile && !selectedChatId && chats.length > 0) {
      // setSelectedChatId(chats[0].id);
    }
  }, [isMobile, selectedChatId, chats, setSelectedChatId]);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
  };

  const handleBack = () => {
    setSelectedChatId(null);
  };
  
  return (
    <div className="flex h-full w-full border-t md:border-t-0 md:border rounded-lg overflow-hidden">
      <div
        className={cn(
          "w-full bg-card border-l transition-transform duration-300 ease-in-out md:w-80 lg:w-96 md:flex md:flex-col",
          isMobile && selectedChatId !== null ? "hidden" : "flex"
        )}
      >
        <ChatList
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
        />
      </div>
      <div className={cn("flex-1 flex-col", isMobile && !selectedChatId ? "hidden" : "flex")}>
        {selectedChat ? (
          <ChatView
            key={selectedChat.id}
            chat={selectedChat}
            onBack={handleBack}
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
