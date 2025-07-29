"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import MainSidebar from '@/components/layout/MainSidebar';
import ChatList from '@/components/chat/ChatList';
import ChatView from '@/components/chat/ChatView';
import SocialFeed from '@/components/social/SocialFeed';
import SettingsView from '@/components/settings/SettingsView';
import UsersView from '@/components/users/UsersView';
import { cn } from '@/lib/utils';
import { PanelLeft, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import AIView from '../ai/AIView';
import AppsView from '../apps/AppsView';

const AppShell = () => {
  const { chats } = useAppContext();
  const [activeTab, setActiveTab] = useState('community');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(chats[1]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    if (activeTab === 'community' && selectedChatId) {
      const chat = chats.find(c => c.id === selectedChatId);
      if (chat) return <ChatView key={chat.id} chat={chat} onBack={() => setSelectedChatId(null)} />;
    }

    switch (activeTab) {
      case 'social':
        return <SocialFeed />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'ai':
        return <AIView />;
      case 'apps':
        return <AppsView />;
      case 'community':
      default:
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-card text-center p-8">
                <MessageCircle size={64} className="text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">مرحباً بك في SebairTel</h2>
                <p className="text-muted-foreground mt-2">اختر محادثة من القائمة للبدء.</p>
            </div>
        );
    }
  };
  
    const showChatList = activeTab === 'community';

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
      <div className={cn(
        "transition-all duration-300 ease-in-out border-l",
        isSidebarOpen && showChatList ? "w-full md:w-80" : "w-0",
        !showChatList && "hidden"
      )}>
        <ChatList
            selectedChatId={selectedChatId}
            setSelectedChatId={(id) => {
              setSelectedChatId(id);
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
          <div className="md:hidden p-2 border-b flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <PanelLeft />
              </Button>
              <h1 className="text-lg font-bold mr-4">SebairTel</h1>
          </div>
          
          <div className={cn("flex-1 overflow-y-auto", { "hidden md:block": showChatList && selectedChatId === null })}>
            {renderContent()}
          </div>
      </main>

       <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default AppShell;
