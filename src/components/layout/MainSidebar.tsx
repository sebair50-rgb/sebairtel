"use client";

import React from 'react';
import { Users, Settings, Brain, AppWindow, MessageSquare } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';

interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAppContext();

  const navItems = [
    { name: 'ai', icon: Brain, label: 'الذكاء الاصطناعي' },
    { name: 'social', icon: Users, label: 'المجتمع' },
    { name: 'contact', icon: MessageSquare, label: 'تواصل' },
    { name: 'apps', icon: AppWindow, label: 'التطبيقات' },
    { name: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <nav className="fixed bottom-0 right-0 w-full bg-card border-t flex justify-around items-center p-2 md:hidden z-50">
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => setActiveTab(item.name)}
          className={cn(
            'flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors duration-200',
            activeTab === item.name
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MainSidebar;
