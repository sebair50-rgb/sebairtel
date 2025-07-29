
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Smile, Paperclip, Mic, Send, X } from 'lucide-react';
import { Card } from '../ui/card';
import type { Message } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

interface MessageInputProps {
    onSendMessage: (text: string, media?: any) => void;
    editingMessage: Message | null;
    onCancelEdit: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, editingMessage, onCancelEdit }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text || '');
            textareaRef.current?.focus();
        } else {
            setText('');
        }
    }, [editingMessage]);

     useEffect(() => {
        const typingTimeout = setTimeout(() => {
            setIsTyping(false);
        }, 1000);

        return () => clearTimeout(typingTimeout);
    }, [text]);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setIsTyping(true);
    };

    return (
        <div className="p-2 md:p-4 bg-transparent border-t border-transparent">
            {editingMessage && (
                <div className="p-2 mb-2 bg-primary/10 rounded-lg text-sm flex justify-between items-center">
                    <div>
                        <p className="font-bold text-primary">تعديل الرسالة</p>
                        <p className="text-muted-foreground truncate max-w-xs">{editingMessage.text}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancelEdit}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <Card className="flex items-end gap-2 p-2 rounded-2xl shadow-sm bg-card">
                <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                    <Smile />
                </Button>
                <Textarea
                    ref={textareaRef}
                    placeholder="اكتب رسالة..."
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base resize-none py-2"
                />
                <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                    <Paperclip />
                </Button>

                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={text ? 'send' : 'mic'}
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                         <Button size="icon" className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12" onClick={handleSend} disabled={!text.trim()}>
                            {text ? <Send /> : <Mic />}
                        </Button>
                    </motion.div>
                </AnimatePresence>
            </Card>
             {isTyping && !text && (
                <div className="text-xs text-muted-foreground text-center pt-1 animate-pulse">
                    جارِ الكتابة...
                </div>
            )}
        </div>
    );
};

export default MessageInput;
