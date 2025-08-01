
"use client";

import React, { useCallback, useMemo } from 'react';
import { Settings, Brain, AppWindow, MessageSquare, LogOut, Phone, Bell, Home } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
  const { currentUser, selectedChatId, setSelectedChatId, settings } = useAppContext();
  const isMobile = useIsMobile();

  const handleTabClick = useCallback((tab: string) => {
    if (tab === 'contact') {
      setSelectedChatId(null);
    }
    setActiveTab(tab);
  }, [setActiveTab, setSelectedChatId]);

  const allNavItems = useMemo(() => [
    { name: 'ai', icon: Brain, label: 'AI', isVisible: settings.interface.showAiTab },
    { name: 'contact', icon: Phone, label: 'Contact', isVisible: settings.interface.showContactTab },
    { name: 'social', icon: Home, label: 'Community', isVisible: settings.interface.showSocialTab },
    { name: 'apps', icon: AppWindow, label: 'Apps', isVisible: settings.interface.showAppsTab },
    { name: 'settings', icon: Settings, label: 'Settings', isVisible: true }, // Always visible
  ], [settings.interface]);
  
  const visibleNavItems = allNavItems.filter(item => item.isVisible);
  
  const showMobileNav = isMobile && selectedChatId === null;


  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col items-center gap-4 p-2 bg-amber-100 dark:bg-stone-900 border-r w-16">
        <div className="my-2">
            <Logo />
        </div>
        <TooltipProvider>
            <div className='flex flex-col items-center gap-4 flex-1'>
                {visibleNavItems.map((item) => (
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
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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
                    <TooltipContent side="right">
                        <p>Sign Out</p>
                    </TooltipContent>
                 </Tooltip>
                 <Avatar>
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </TooltipProvider>
      </nav>

      {/* Mobile Bottom Nav */}
      {showMobileNav && (
        <nav className="fixed bottom-0 left-0 w-full bg-amber-100 dark:bg-stone-900 border-t flex justify-around items-center p-1 md:hidden z-50">
          {visibleNavItems.map((item) => (
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
            </button>
          ))}
        </nav>
      )}
    </>
  );
};

export default MainSidebar;
