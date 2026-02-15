
"use client";

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Smile, Paperclip, Mic, Send, X, Square, Trash2, Code } from 'lucide-react';
import { Card } from '../ui/card';
import type { Message } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageInputProps {
    onSendMessage: (text: string, options: { type: Message['type'], media?: any }) => void;
    editingMessage: Message | null;
    onCancelEdit: () => void;
    replyingToMessage: Message | null;
    onCancelReply: () => void;
}

export interface MessageInputHandles {
  setText: (text: string) => void;
  focus: () => void;
}

const MessageInput = forwardRef<MessageInputHandles, MessageInputProps>(({ onSendMessage, editingMessage, onCancelEdit, replyingToMessage, onCancelReply }, ref) => {
    const [text, setText] = useState('');
    const [isCodeMode, setIsCodeMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<{ src: string; blob: Blob; } | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useImperativeHandle(ref, () => ({
      setText: (text: string) => {
        setText(text);
        textareaRef.current?.focus();
      },
       focus: () => {
        textareaRef.current?.focus();
      }
    }));

    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text || '');
            textareaRef.current?.focus();
        } else if (!replyingToMessage) { // Don't clear text when starting a reply
            setText('');
        }
    }, [editingMessage, replyingToMessage]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileDataUrl = event.target?.result as string;
            const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'file');
            const fileInfo = { name: file.name, size: file.size, type: file.type };
            
            onSendMessage(text, { type: fileType, media: { src: fileDataUrl, fileInfo } });
            setText('');
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        if(e.target) {
            e.target.value = "";
        }
    }, [onSendMessage, text]);

    const handleSend = useCallback(() => {
        if (text.trim()) {
            onSendMessage(text, { type: isCodeMode ? 'code' : 'text' });
            setText('');
            if (isCodeMode) setIsCodeMode(false);
        }
    }, [onSendMessage, text, isCodeMode]);
    
    const startRecording = useCallback(async () => {
        if (recordedAudio) setRecordedAudio(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudio({ src: audioUrl, blob: audioBlob });
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast({
                variant: 'destructive',
                title: "Error accessing microphone",
                description: "Please ensure you have granted permission to use the microphone."
            });
        }
    }, [recordedAudio, toast]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const handleMicClick = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    const handleSendAudio = useCallback(() => {
        if (recordedAudio) {
            const fileInfo = { name: `recording_${Date.now()}.webm`, size: recordedAudio.blob.size, type: recordedAudio.blob.type };
            onSendMessage("", { type: 'audio', media: { src: recordedAudio.src, fileInfo } });
            setRecordedAudio(null);
        }
    }, [recordedAudio, onSendMessage]);

    const handleCancelAudio = useCallback(() => {
        setRecordedAudio(null);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const hasContent = text.trim().length > 0;
    
    const toggleCodeMode = () => {
        setIsCodeMode(!isCodeMode);
        if (!isCodeMode) {
            // entering code mode
            setText('');
        }
        textareaRef.current?.focus();
    };

    return (
        <div className="p-2 md:p-4 bg-transparent border-t border-transparent mb-2">
            {editingMessage && (
                <div className="p-2 mb-2 bg-primary/10 rounded-lg text-sm flex justify-between items-center">
                    <div>
                        <p className="font-bold text-primary">Editing Message</p>
                        <p className="text-muted-foreground truncate max-w-xs">{editingMessage.text}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancelEdit}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {replyingToMessage && !editingMessage && (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2 mb-2 bg-muted/70 backdrop-blur-sm rounded-lg text-sm flex justify-between items-center border-l-4 border-primary"
                >
                    <div>
                        <p className="font-bold text-primary">Replying to {replyingToMessage.user}</p>
                        <p className="text-muted-foreground truncate max-w-xs">{replyingToMessage.text || 'Attachment'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancelReply}>
                        <X className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}
            
            <AnimatePresence>
            {recordedAudio && !isRecording && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <Card className="flex items-center gap-2 p-2 rounded-2xl shadow-sm bg-card">
                        <Button variant="ghost" size="icon" className="text-destructive rounded-full" onClick={handleCancelAudio}>
                            <Trash2 />
                        </Button>
                        <div className="flex-1">
                            <audio src={recordedAudio.src} controls className="w-full h-10" />
                        </div>
                        <Button size="icon" className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12" onClick={handleSendAudio}>
                            <Send />
                        </Button>
                    </Card>
                 </motion.div>
            )}

            {!recordedAudio && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card className="flex items-end gap-2 p-2 rounded-2xl shadow-sm bg-card transition-all">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,application/*,text/*"
                    />
                    <div className="flex">
                        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                            <Smile />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full" onClick={toggleCodeMode}>
                            <Code className={cn(isCodeMode && "text-primary")} />
                        </Button>
                    </div>
                    <Textarea
                        ref={textareaRef}
                        placeholder={isRecording ? "Recording..." : (isCodeMode ? "Paste your code here..." : "Type a message...")}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className={cn("flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base resize-none py-2", isCodeMode && "font-code text-sm")}
                        dir={isCodeMode ? "ltr" : undefined}
                        disabled={isRecording}
                    />
                    {!hasContent && !isRecording && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip />
                        </Button>
                    )}
                    
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={hasContent ? 'send' : 'mic'}
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button 
                                size="icon" 
                                className={cn(
                                    "bg-primary hover:bg-primary/90 rounded-full w-12 h-12 transition-colors duration-300",
                                    isRecording && "bg-destructive hover:bg-destructive/90"
                                )}
                                onClick={hasContent ? handleSend : handleMicClick}
                            >
                                {hasContent ? <Send /> : (isRecording ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1}}><Square className="fill-white" /></motion.div> : <Mic />) }
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </Card>
                </motion.div>
            )}
            </AnimatePresence>

        </div>
    );
});
MessageInput.displayName = 'MessageInput';

export default React.memo(MessageInput);
