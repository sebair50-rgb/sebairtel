
"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, UserPlus, PhoneMissed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    
    const timeAgo = formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: ar });

    const getIcon = () => {
        switch (notification.type) {
            case 'like':
                return <Heart className="w-5 h-5 text-white" />;
            case 'new_friend':
                return <UserPlus className="w-5 h-5 text-white" />;
            case 'missed_call':
                return <PhoneMissed className="w-5 h-5 text-white" />;
            default:
                return null;
        }
    };
    
    const getIconBgColor = () => {
        switch (notification.type) {
            case 'like': return 'bg-red-500';
            case 'new_friend': return 'bg-blue-500';
            case 'missed_call': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }

    return (
        <Card className={cn(
            "p-4 flex items-start gap-4 transition-colors hover:bg-muted/50",
            !notification.isRead && "bg-primary/5 border-primary/20"
        )}>
            <div className="relative">
                <Avatar className="h-12 w-12">
                    <AvatarFallback>{notification.fromUser.avatar}</AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute -bottom-1 -right-1 rounded-full p-1.5 flex items-center justify-center",
                    getIconBgColor()
                )}>
                    {getIcon()}
                </div>
            </div>
            <div className="flex-1">
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: notification.message.replace(notification.fromUser.name, `<strong>${notification.fromUser.name}</strong>`) }} />
                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
            </div>
             {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full self-center" />
            )}
        </Card>
    );
};

export default NotificationItem;
