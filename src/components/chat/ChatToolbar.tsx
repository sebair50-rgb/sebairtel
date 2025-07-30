
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, Sparkles, Loader2, X, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/store/AppContext';

interface ChatToolbarProps {
    onSelectSmartReply: (reply: string) => void;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({ onSelectSmartReply }) => {
    const { readChatAloud, isReadingAloud } = useAppContext();
    const [isLoading, setIsLoading] = useState<'read-chat' | null>(null);
    const { toast } = useToast();

    const handleReadChatClick = async () => {
        // If it's already playing, the context function will handle pausing.
        if (isReadingAloud) {
            readChatAloud();
            return;
        }
        
        setIsLoading('read-chat');
        try {
            await readChatAloud();
        } catch (error) {
            console.error('Failed to read chat aloud:', error);
            toast({ variant: 'destructive', title: 'فشل قراءة المحادثة' });
        } finally {
            setIsLoading(null);
        }
    }
    
    return (
        <div className="px-2 md:px-4">
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleReadChatClick} disabled={isLoading === 'read-chat'} className="rounded-full">
                     {isLoading === 'read-chat' ? <Loader2 className="animate-spin" /> : (isReadingAloud ? <StopCircle className="text-destructive" /> : <Headphones />) }
                </Button>
            </div>
        </div>
    );
};

export default ChatToolbar;
