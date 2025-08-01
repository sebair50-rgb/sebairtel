
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Bell, Trash, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/lib/types';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import AppHeader from '../layout/AppHeader';

const NotificationsView = () => {
    const { notifications, setActiveTab, setSelectedChatId, setInitialContactTab, deleteNotifications } = useAppContext();
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleNotificationClick = (notification: Notification) => {
        if (isSelectionMode) {
            handleSelect(notification.id);
            return;
        }

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
        }
    }
    
    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === notifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(notifications.map(n => n.id)));
        }
    };
    
    const handleDeleteSelected = async () => {
        await deleteNotifications(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    };
    
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="border-b bg-background z-10">
                <AppHeader title="Notifications" icon={Bell} />
                <div className="flex items-center justify-end px-4 md:px-6 pb-2">
                    {notifications.length > 0 && (
                        <Button variant="outline" onClick={toggleSelectionMode}>
                           {isSelectionMode ? 'Cancel' : 'Select'}
                        </Button>
                    )}
                </div>
            </div>
            
            <AnimatePresence>
            {isSelectionMode && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 md:p-4 bg-background border-b shadow-sm overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={handleSelectAll}>
                                {selectedIds.size === notifications.length ? <XCircle /> : <CheckCircle />}
                                {selectedIds.size === notifications.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
                            <Trash className="mr-2" />
                            Delete ({selectedIds.size})
                        </Button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            <ScrollArea className="flex-1 bg-slate-100">
                 <div className="p-4 md:p-6 space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <NotificationItem 
                                key={notification.id} 
                                notification={notification} 
                                onClick={() => handleNotificationClick(notification)}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedIds.has(notification.id)}
                            />
                        ))
                    ) : (
                        <Card className="text-center text-muted-foreground p-8 mt-8">
                            <Bell size={48} className="mx-auto mb-4" />
                            <p className="font-semibold">No new notifications</p>
                            <p className="text-sm">
                                Notifications about new interactions will appear here.
                            </p>
                        </Card>
                    )}
                 </div>
            </ScrollArea>
        </div>
    );
};

export default NotificationsView;
