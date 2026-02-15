
"use client";

import React from 'react';
import MainSidebar from '@/components/layout/MainSidebar';
import CommunityPosts from '@/components/social/CommunityPosts';
import SettingsView from '@/components/settings/SettingsView';
import AIView from '../ai/AIView';
import AppsView from '../apps/AppsView';
import CallsView from '../calls/CallsView';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import CallManager from '../calls/CallManager';
import NotificationsView from '../notifications/NotificationsView';


const AppShell = () => {
  const { activeTab, setActiveTab } = useAppContext();
  const { logout } = useAuth();
  const router = useRouter();

  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'social':
        return <CommunityPosts />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      case 'ai':
        return <AIView />;
      case 'apps':
        return <AppsView />;
      case 'contact':
        return <CallsView setActiveTab={setActiveTab} />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <CallsView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-y-auto">
            {renderContent()}
          </div>
      </main>
      <CallManager />
    </div>
  );
};

export default AppShell;
