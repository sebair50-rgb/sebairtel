
"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, UserPlus, PhoneMissed, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { AnimatePresence, motion } from 'framer-motion';

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick, isSelectionMode, isSelected }) => {
    
    const timeAgo = formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: enUS });

    const getIcon = () => {
        switch (notification.type) {
            case 'like':
                return <Heart className="w-5 h-5 text-white" />;
            case 'new_friend':
            case 'friend_request':
                return <UserPlus className="w-5 h-5 text-white" />;
            case 'missed_call':
                return <PhoneMissed className="w-5 h-5 text-white" />;
            case 'new_message':
                return <MessageSquare className="w-5 h-5 text-white" />;
            default:
                return null;
        }
    };
    
    const getIconBgColor = () => {
        switch (notification.type) {
            case 'like': return 'bg-red-500';
            case 'new_friend': return 'bg-blue-500';
            case 'friend_request': return 'bg-blue-500';
            case 'missed_call': return 'bg-yellow-500';
            case 'new_message': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }

    return (
        <Card 
            className={cn(
                "p-4 flex items-center gap-4 transition-colors duration-300",
                !notification.isRead && "bg-primary/5 border-primary/20",
                isSelectionMode ? "cursor-pointer" : (notification.link ? "cursor-pointer hover:bg-muted/50" : "cursor-default"),
                isSelected && "bg-blue-100 dark:bg-blue-900/30 border-blue-500"
            )}
            onClick={onClick}
        >
            <AnimatePresence>
            {isSelectionMode && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.5, width: 0 }}
                    className="overflow-hidden"
                >
                    <Checkbox checked={isSelected} className="mr-2" />
                 </motion.div>
            )}
            </AnimatePresence>
            <div className="relative">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={notification.fromUser.avatar} alt={notification.fromUser.name} />
                    <AvatarFallback>{notification.fromUser.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute -bottom-1 -left-1 rounded-full p-1.5 flex items-center justify-center",
                    getIconBgColor()
                )}>
                    {getIcon()}
                </div>
            </div>
            <div className="flex-1">
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: notification.message }} />
                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
            </div>
             {!notification.isRead && !isSelectionMode && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full self-center" />
            )}
        </Card>
    );
};

export default NotificationItem;
