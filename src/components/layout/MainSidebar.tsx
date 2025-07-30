
"use client";

import React from 'react';
import { Users, Settings, Brain, AppWindow, MessageSquare, LogOut, Phone, Bell } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useIsMobile from '@/hooks/use-is-mobile';
import Logo from '../shared/Logo';
import { Badge } from '../ui/badge';


interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { currentUser, selectedChatId, setSelectedChatId, unreadNotificationCount, markNotificationsAsRead } = useAppContext();
  const isMobile = useIsMobile();

  const handleTabClick = (tab: string) => {
    if (tab === 'contact') {
      setSelectedChatId(null);
    }
    if (tab === 'notifications' && unreadNotificationCount > 0) {
      markNotificationsAsRead();
    }
    setActiveTab(tab);
  };

  const navItems = [
    { name: 'ai', icon: Brain, label: 'الذكاء الاصطناعي' },
    { name: 'contact', icon: Phone, label: 'تواصل' },
    { name: 'social', icon: Users, label: 'المجتمع' },
    { name: 'notifications', icon: Bell, label: 'الإشعارات', badge: unreadNotificationCount },
    { name: 'apps', icon: AppWindow, label: 'التطبيقات' },
    { name: 'settings', icon: Settings, label: 'الإعدادات' },
  ];
  
  const showMobileNav = isMobile && selectedChatId === null;


  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col items-center gap-4 p-2 bg-card border-l w-16">
        <div className="my-2">
            <Logo />
        </div>
        <TooltipProvider>
            <div className='flex flex-col items-center gap-4 flex-1'>
                {navItems.map((item) => (
                    <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                             <Button
                                variant={activeTab === item.name ? 'secondary': 'ghost'}
                                size="icon"
                                onClick={() => handleTabClick(item.name)}
                                className={cn(
                                    'rounded-lg transition-colors duration-200 w-12 h-12 relative',
                                    activeTab === item.name && 'text-primary'
                                )}
                                >
                                <item.icon size={24} />
                                 {item.badge && item.badge > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{item.badge}</Badge>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
            <div className='flex flex-col items-center gap-2'>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='ghost' size="icon" onClick={onLogout} className="rounded-lg w-12 h-12">
                            <LogOut size={24} className='text-muted-foreground'/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>تسجيل الخروج</p>
                    </TooltipContent>
                 </Tooltip>
                 <Avatar>
                    <AvatarFallback>{currentUser?.avatar || currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </TooltipProvider>
      </nav>

      {/* Mobile Bottom Nav */}
      {showMobileNav && (
        <nav className="fixed bottom-0 right-0 w-full bg-card border-t flex justify-around items-center p-1 md:hidden z-50">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabClick(item.name)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors duration-200 text-[10px] relative',
                activeTab === item.name
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon size={20} />
              <span className="mt-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge className="absolute top-1 right-3 h-4 w-4 justify-center p-0 text-[8px]">{item.badge}</Badge>
              )}
            </button>
          ))}
        </nav>
      )}
    </>
  );
};

export default MainSidebar;
