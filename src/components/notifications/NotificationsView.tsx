
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/lib/types';

const NotificationsView = () => {
    const { notifications, setActiveTab, setSelectedChatId, setInitialContactTab } = useAppContext();

    const handleNotificationClick = (notification: Notification) => {
        // Handle friend request notification
        if (notification.type === 'friend_request') {
            setInitialContactTab('friends');
            setActiveTab('contact');
            return;
        }

        if (notification.link) {
            const parts = notification.link.split('/');
            if (parts[1] === 'chats' && parts[2]) {
                const chatId = parts[2];
                setSelectedChatId(chatId);
                setActiveTab('contact');
            }
             if (parts[1] === 'users') {
                setInitialContactTab('friends');
                setActiveTab('contact');
            }
            // Can be extended for other link types like /posts/postId123
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 md:p-6 pb-4 border-b bg-background z-10">
                <div className="flex items-center gap-2">
                    <Bell className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">الإشعارات</h1>
                </div>
            </div>
            
            <ScrollArea className="flex-1 bg-slate-100">
                 <div className="p-4 md:p-6 space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <NotificationItem 
                                key={notification.id} 
                                notification={notification} 
                                onClick={() => handleNotificationClick(notification)}
                            />
                        ))
                    ) : (
                        <Card className="text-center text-muted-foreground p-8 mt-8">
                            <Bell size={48} className="mx-auto mb-4" />
                            <p className="font-semibold">لا توجد إشعارات جديدة</p>
                            <p className="text-sm">
                                ستظهر الإشعارات الخاصة بالتفاعلات الجديدة هنا.
                            </p>
                        </Card>
                    )}
                 </div>
            </ScrollArea>
        </div>
    );
};

export default NotificationsView;
