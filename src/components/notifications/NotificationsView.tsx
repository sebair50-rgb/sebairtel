
"use client";

import React, { useEffect } from 'react';
import { useAppContext } from '@/store/AppContext';
import { ScrollArea } from '../ui/scroll-area';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface NotificationsViewProps {
    onNotificationClick: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ onNotificationClick }) => {
    const { notifications, markNotificationsAsRead, setSelectedChatId, setActiveTab } = useAppContext();

    useEffect(() => {
        // Mark notifications as read when the component is opened.
        // A short delay prevents marking as read from a brief flash of the component.
        const timer = setTimeout(() => {
            markNotificationsAsRead();
        }, 1000);

        return () => clearTimeout(timer);
    }, [markNotificationsAsRead]);
    
    const handleItemClick = (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) return;

        if (notification.referenceType === 'chat') {
            setSelectedChatId(notification.referenceId);
            setActiveTab('contact');
        } else if (notification.referenceType === 'post') {
            // Future enhancement: navigate to post detail view
            setActiveTab('social');
        } else if (notification.referenceType === 'call') {
            setActiveTab('contact');
            // This would ideally open the calls tab within CallsView
        }
        
        onNotificationClick(); // Close the sheet
    }

    return (
        <ScrollArea className="h-[calc(100vh-80px)]">
            {notifications.length > 0 ? (
                <div className="p-4 space-y-3">
                    {notifications.map(notification => (
                       <NotificationItem 
                            key={notification.id} 
                            notification={notification} 
                            onClick={() => handleItemClick(notification.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Bell size={64} className="mb-4" />
                    <h2 className="text-xl font-bold">لا توجد إشعارات</h2>
                    <p>تبدو الأمور هادئة هنا. ستظهر الإشعارات الجديدة في هذه القائمة.</p>
                </div>
            )}
        </ScrollArea>
    );
};

export default NotificationsView;
