
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, Sparkles, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatToolbarProps {
    onSmartReply: () => Promise<string[]>;
    onReadChat: () => Promise<void>;
    onSelectSmartReply: (reply: string) => void;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({ onSmartReply, onReadChat, onSelectSmartReply }) => {
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
        setIsLoading('read-chat');
        try {
            await onReadChat();
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
                <Button variant="ghost" size="icon" onClick={handleSmartReplyClick} disabled={!!isLoading} className="rounded-full">
                    {isLoading === 'smart-reply' ? <Loader2 className="animate-spin" /> : smartReplies.length > 0 ? <X/> : <Sparkles />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleReadChatClick} disabled={!!isLoading} className="rounded-full">
                     {isLoading === 'read-chat' ? <Loader2 className="animate-spin" /> : <Headphones />}
                </Button>
            </div>
        </div>
    );
};

export default ChatToolbar;
