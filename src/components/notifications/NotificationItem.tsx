
"use client";

import React from 'react';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Heart, MessageSquare, PhoneMissed } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'like':
            return <Heart className="w-5 h-5 text-red-500" />;
        case 'request':
            return <MessageSquare className="w-5 h-5 text-blue-500" />;
        case 'missed_call':
            return <PhoneMissed className="w-5 h-5 text-destructive" />;
        default:
            return null;
    }
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
    
    const timeAgo = formatDistanceToNow(notification.timestamp.toDate(), {
        addSuffix: true,
        locale: ar,
    });

    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-start gap-4 p-3 rounded-lg text-right transition-colors",
                notification.isRead ? 'bg-transparent' : 'bg-primary/10',
                "hover:bg-accent"
            )}
        >
            <div className="relative">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-card p-1 rounded-full">
                    <NotificationIcon type={notification.type} />
                </div>
            </div>
            <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-primary font-semibold mt-1">{timeAgo}</p>
            </div>
        </button>
    );
};

export default NotificationItem;
