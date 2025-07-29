"use client";

import React from 'react';
import { MessageCircle, Users, Sun, Moon, Settings, User, Brain } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import NewSebairTelLogo from '@/components/shared/Logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { darkMode, toggleDarkMode, currentUser } = useAppContext();

  const navItems = [
    { name: 'community', icon: MessageCircle, label: 'المحادثات' },
    { name: 'social', icon: Users, label: 'الاجتماعي' },
    { name: 'ai', icon: Brain, label: 'الذكاء الاصطناعي' },
    { name: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="w-16 bg-card border-l flex flex-col items-center justify-between p-2">
        <div>
          <div className="mb-6">
            <NewSebairTelLogo />
          </div>
          <nav className="flex flex-col items-center gap-4">
            {navItems.map((item) => (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={cn(
                      'p-2 rounded-lg transition-colors duration-200',
                      activeTab === item.name
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
              >
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              <p>{darkMode ? 'وضع النهار' : 'الوضع الداكن'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${currentUser.name}`} />
                <AvatarFallback>{currentUser.avatar}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              <p>{currentUser.name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default MainSidebar;
