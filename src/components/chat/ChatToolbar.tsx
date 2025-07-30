
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, Sparkles, Loader2, X, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/store/AppContext';

interface ChatToolbarProps {
    onSmartReply: () => Promise<string[]>;
    onSelectSmartReply: (reply: string) => void;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({ onSmartReply, onSelectSmartReply }) => {
    const { readChatAloud, isReadingAloud } = useAppContext();
    const [isLoading, setIsLoading] = useState<'smart-reply' | 'read-chat' | null>(null);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const { toast } = useToast();

    const handleSmartReplyClick = async () => {
        if (smartReplies.length > 0) {
            setSmartReplies([]);
            return;
        }
        setIsLoading('smart-reply');
        try {
            const replies = await onSmartReply();
            setSmartReplies(replies);
        } catch (error) {
            console.error('Failed to get smart replies:', error);
            toast({ variant: 'destructive', title: 'فشل اقتراح الردود' });
        } finally {
            setIsLoading(null);
        }
    };
    
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
    
    const handleReplySelect = (reply: string) => {
        onSelectSmartReply(reply);
        setSmartReplies([]);
    }

    return (
        <div className="px-2 md:px-4">
             <AnimatePresence>
                {smartReplies.length > 0 && (
                    <motion.div 
                        className="flex flex-wrap gap-2 mb-2 justify-end"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        {smartReplies.map((reply, i) => (
                            <Button key={i} variant="outline" size="sm" onClick={() => handleReplySelect(reply)} className="rounded-full bg-background/80 backdrop-blur-sm">
                                {reply}
                            </Button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleSmartReplyClick} disabled={!!isLoading || isReadingAloud} className="rounded-full">
                    {isLoading === 'smart-reply' ? <Loader2 className="animate-spin" /> : smartReplies.length > 0 ? <X/> : <Sparkles />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleReadChatClick} disabled={isLoading === 'smart-reply'} className="rounded-full">
                     {isLoading === 'read-chat' ? <Loader2 className="animate-spin" /> : (isReadingAloud ? <StopCircle className="text-destructive" /> : <Headphones />) }
                </Button>
            </div>
        </div>
    );
};

export default ChatToolbar;
