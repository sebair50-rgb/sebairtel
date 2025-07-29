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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarOpen && showChatList ? "w-80 border-l" : "w-0"
      )}>
        {showChatList && (
            <div className="h-full w-80">
            <ChatList
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            </div>
        )}
      </div>
      
      <main className="flex-1 flex flex-col">
          <div className="md:hidden p-2 border-b flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <PanelLeft />
              </Button>
              <h1 className="text-lg font-bold mr-4">SebairTel</h1>
          </div>
          {/* Mobile sidebar overlay */}
          {isSidebarOpen && showChatList && (
              <div
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 z-30 bg-black/50 md:hidden"
              />
          )}
          {/* Mobile sidebar content */}
          {showChatList && (
            <div className={cn(
                "fixed top-0 right-0 h-full w-80 bg-card border-l z-40 transition-transform duration-300 ease-in-out md:hidden",
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <ChatList
                    selectedChatId={selectedChatId}
                    setSelectedChatId={(id) => {
                    setSelectedChatId(id);
                    setIsSidebarOpen(false);
                    }}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
      </main>
    </div>
  );
};

export default AppShell;
