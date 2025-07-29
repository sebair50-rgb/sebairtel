
"use client";

import React, { useState } from 'react';
import MainSidebar from '@/components/layout/MainSidebar';
import SocialFeed from '@/components/social/SocialFeed';
import SettingsView from '@/components/settings/SettingsView';
import AIView from '../ai/AIView';
import AppsView from '../apps/AppsView';
import { useAuth } from '@/store/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CallsView from '../calls/CallsView';

const AppShell = () => {
  const { user: authUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('contact');
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'social':
        return <SocialFeed />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      case 'ai':
        return <AIView />;
      case 'apps':
        return <AppsView />;
      case 'contact':
        return <CallsView />;
      default:
        return <CallsView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-y-auto">
            {renderContent()}
          </div>
      </main>
    </div>
  );
};

export default AppShell;
