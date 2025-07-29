
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
import { MessageCircle, Users as UsersIcon, List } from 'lucide-react';
import AIView from '../ai/AIView';
import AppsView from '../apps/AppsView';
import { useAuth } from '@/store/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CallsView from '../calls/CallsView';

const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
        <Icon size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
    </div>
);

const AppShell = () => {
  const { chats, currentUser } = useAppContext();
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('social');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [communityTab, setCommunityTab] = useState('chats');

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  const handleCommunityTabChange = (tab: string) => {
    setCommunityTab(tab);
    setSelectedChatId(null);
  };

  const renderCommunityChatContent = () => {
      if(selectedChatId) {
          const chat = chats.find(c => c.id === selectedChatId);
          if (chat) return <ChatView key={chat.id} chat={chat} onBack={() => setSelectedChatId(null)} />;
      }
      return (
        <div className="hidden md:flex flex-col items-center justify-center h-full bg-card text-center p-8">
            <MessageCircle size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">مرحباً بك في SebairTel, {currentUser.name}!</h2>
            <p className="text-muted-foreground mt-2">اختر محادثة من القائمة للبدء.</p>
        </div>
      );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'social':
        return <SocialFeed />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      case 'ai':
        return <AIView />;
      case 'apps':
        return <AppsView />;
      case 'community':
         return (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <Tabs value={communityTab} onValueChange={handleCommunityTabChange} className="w-full h-full flex flex-col">
                    <div className="flex-shrink-0 px-4 pt-4 border-b">
                         <TabsList className="grid w-full grid-cols-4 gap-1 h-auto">
                            <TabsTrigger value="friends">الأصدقاء</TabsTrigger>
                            <TabsTrigger value="groups">مجموعات</TabsTrigger>
                            <TabsTrigger value="calls">المكالمات</TabsTrigger>
                            <TabsTrigger value="chats">الدردشات</TabsTrigger>
                         </TabsList>
                    </div>
                    <TabsContent value="chats" className="flex-1 overflow-hidden h-full mt-0">
                        {renderCommunityChatContent()}
                    </TabsContent>
                    <TabsContent value="calls" className="flex-1 overflow-hidden h-full mt-0">
                        <CallsView />
                    </TabsContent>
                    <TabsContent value="groups" className="flex-1 mt-0">
                        <ComingSoonContent title="مجموعات الدردشة" icon={UsersIcon} />
                    </TabsContent>
                    <TabsContent value="friends" className="flex-1 mt-0">
                        <ComingSoonContent title="قائمة الأصدقاء" icon={List} />
                    </TabsContent>
                </Tabs>
            </div>
         )
      default:
        return <SocialFeed />;
    }
  };
  
  const showChatList = activeTab === 'community' && communityTab === 'chats';
  const isChatViewActive = showChatList && selectedChatId !== null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
      <div className={cn(
        "transition-all duration-300 ease-in-out border-l md:flex flex-col",
        "w-full md:w-80",
        !showChatList && "hidden",
        isChatViewActive ? "hidden md:flex" : "flex",
        isSidebarOpen ? "md:w-80" : "md:w-0"
      )}>
        <ChatList
            selectedChatId={selectedChatId}
            setSelectedChatId={(id) => {
              setSelectedChatId(id);
            }}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden",
        { "pb-16 md:pb-0": !isChatViewActive }
      )}>
          <div className={cn(
              "flex-1 flex overflow-y-auto",
              // Hide main content on mobile if we are in chat list view but not in a chat
              { "hidden": showChatList && !isChatViewActive  },
              { "flex md:hidden": activeTab === 'community' && communityTab === 'chats' && !isChatViewActive }
          )}>
            { activeTab === 'community' && communityTab === 'chats' && !isChatViewActive ? (
                 <div className="w-full">
                     <ChatList
                        selectedChatId={selectedChatId}
                        setSelectedChatId={setSelectedChatId}
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                 </div>
            ) : renderContent() }
          </div>
      </main>
      
       {!isChatViewActive && <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default AppShell;
