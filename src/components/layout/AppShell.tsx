
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import MainSidebar from '@/components/layout/MainSidebar';
import SocialFeed from '@/components/social/SocialFeed';
import SettingsView from '@/components/settings/SettingsView';
import UsersView from '@/components/users/UsersView';
import { cn } from '@/lib/utils';
import AIView from '../ai/AIView';
import AppsView from '../apps/AppsView';
import { useAuth } from '@/store/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const AppShell = () => {
  const { chats, currentUser } = useAppContext();
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('social');
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

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
      default:
        return <SocialFeed />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden",
        "pb-16 md:pb-0"
      )}>
          <div className={cn(
              "flex-1 flex overflow-y-auto"
          )}>
            {renderContent()}
          </div>
      </main>
      
       <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default AppShell;
