
"use client";

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageSquare, Users, Bell, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';

interface AppHeaderProps {
    title: string;
    icon: React.ElementType;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, icon: Icon }) => {
    const { chats, currentUser, setActiveTab, setSelectedChatId, setInitialContactTab, unreadNotificationCount, markNotificationsAsRead } = useAppContext();

    const totalUnreadCount = React.useMemo(() => {
        if (!currentUser) return 0;
        return chats.reduce((acc, chat) => acc + (chat.unreadCount?.[currentUser.id] || 0), 0);
    }, [chats, currentUser]);

    const handleMessagesClick = () => {
        setInitialContactTab('chats');
        setSelectedChatId(null);
        setActiveTab('contact');
    };
    
    const handleFriendsClick = () => {
        setInitialContactTab('friends');
        setActiveTab('contact');
    };
    
    const handleNotificationsClick = () => {
        if (unreadNotificationCount > 0) {
            markNotificationsAsRead();
        }
        setActiveTab('notifications');
    };

    return (
        <header className="p-4 md:px-6 md:py-4 border-b bg-primary text-primary-foreground z-10 sticky top-0">
             <div className="flex items-center justify-between gap-3">
                <div dir="ltr" className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <Icon className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={handleNotificationsClick} className="relative hover:bg-primary/80">
                        <Bell className="w-6 h-6" />
                        {unreadNotificationCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadNotificationCount}</Badge>
                        )}
                    </Button>
                     <Button variant="ghost" size="icon" onClick={handleFriendsClick} className="relative hover:bg-primary/80">
                        <Users className="w-6 h-6" />
                    </Button>
                     <Button variant="ghost" size="icon" onClick={handleMessagesClick} className="relative hover:bg-primary/80">
                        <MessageSquare className="w-6 h-6" />
                        {totalUnreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{totalUnreadCount}</Badge>
                        )}
                    </Button>
                     <Button variant="ghost" size="icon" className="hover:bg-primary/80">
                        <ShoppingCart className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default AppHeader;
