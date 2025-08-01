
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
    const { readChatAloud, isReadingAloud, fetchSmartReplies, smartReplies, clearSmartReplies } = useAppContext();
    const [isLoading, setIsLoading] = useState<'read-chat' | 'smart-reply' | null>(null);
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
            toast({ variant: 'destructive', title: 'Failed to read chat' });
        } finally {
            setIsLoading(null);
        }
    }
    
    const handleSmartReplyClick = async () => {
        if (smartReplies.length > 0) {
            clearSmartReplies();
            return;
        }
        setIsLoading('smart-reply');
        try {
            await fetchSmartReplies();
        } catch (error) {
            console.error('Failed to fetch smart replies:', error);
            toast({ variant: 'destructive', title: 'Failed to fetch smart replies' });
        } finally {
            setIsLoading(null);
        }
    }

    return (
        <div className="px-2 md:px-4 space-y-2">
            <AnimatePresence>
                {smartReplies.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 flex-wrap"
                    >
                        {smartReplies.map((reply, index) => (
                            <Button 
                                key={index}
                                variant="outline" 
                                size="sm" 
                                className="rounded-full bg-background/70 backdrop-blur-sm"
                                onClick={() => onSelectSmartReply(reply)}
                            >
                                {reply}
                            </Button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleReadChatClick} disabled={isLoading === 'read-chat'} className="rounded-full">
                     {isLoading === 'read-chat' ? <Loader2 className="animate-spin" /> : (isReadingAloud ? <StopCircle className="text-destructive" /> : <Headphones />) }
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSmartReplyClick} disabled={isLoading === 'smart-reply'} className="rounded-full">
                     {isLoading === 'smart-reply' ? <Loader2 className="animate-spin" /> : (smartReplies.length > 0 ? <X /> : <Sparkles />) }
                </Button>
            </div>
        </div>
    );
};

export default ChatToolbar;
