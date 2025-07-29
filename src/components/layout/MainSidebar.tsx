
"use client";

import React from 'react';
import { Users, Settings, Brain, AppWindow, MessageSquare, LogOut, Phone } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useIsMobile from '@/hooks/use-is-mobile';
import Logo from '../shared/Logo';

interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, selectedChatId, setSelectedChatId } = useAppContext();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleTabClick = (tab: string) => {
    if (tab === 'contact') {
      setSelectedChatId(null);
    }
    setActiveTab(tab);
  };

  const navItems = [
    { name: 'ai', icon: Brain, label: 'الذكاء الاصطناعي' },
    { name: 'contact', icon: Phone, label: 'تواصل' },
    { name: 'social', icon: Users, label: 'المجتمع' },
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
                                    'rounded-lg transition-colors duration-200 w-12 h-12',
                                    activeTab === item.name && 'text-primary'
                                )}
                                >
                                <item.icon size={24} />
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
                        <Button variant='ghost' size="icon" onClick={handleLogout} className="rounded-lg w-12 h-12">
                            <LogOut size={24} className='text-destructive'/>
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
                'flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors duration-200 text-[10px]',
                activeTab === item.name
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon size={20} />
              <span className="mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
};

export default MainSidebar;
