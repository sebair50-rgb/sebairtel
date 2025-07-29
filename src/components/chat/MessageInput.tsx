
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Smile, Paperclip, Mic, Send, X, Square, Trash2, Play } from 'lucide-react';
import { Card } from '../ui/card';
import type { Message } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageInputProps {
    onSendMessage: (text: string, media?: any) => void;
    editingMessage: Message | null;
    onCancelEdit: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, editingMessage, onCancelEdit }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const { toast } = useToast();

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<{ src: string; blob: Blob; } | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


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

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileDataUrl = event.target?.result as string;
            const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'file');
            const fileInfo = { name: file.name, size: file.size, type: file.type };
            
            onSendMessage(text, { type: fileType, src: fileDataUrl, fileInfo });
            setText('');
        };
        reader.readAsDataURL(file);
    }, [onSendMessage, text]);

    const handleSend = useCallback(() => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    }, [onSendMessage, text]);
    
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
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast({
                variant: 'destructive',
                title: "خطأ في الوصول للميكروفون",
                description: "الرجاء التأكد من منح الإذن لاستخدام الميكروفون."
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
            onSendMessage("", { type: 'audio', src: recordedAudio.src, fileInfo });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setIsTyping(true);
    };

    const hasContent = text.trim().length > 0;

    return (
        <div className="p-2 md:p-4 bg-transparent border-t border-transparent mb-2">
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
            
            {recordedAudio ? (
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
            ) : (
                <Card className="flex items-end gap-2 p-2 rounded-2xl shadow-sm bg-card">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,application/*,text/*"
                    />
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                        <Smile />
                    </Button>
                    <Textarea
                        ref={textareaRef}
                        placeholder={isRecording ? "جارِ التسجيل..." : "اكتب رسالة..."}
                        value={text}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base resize-none py-2"
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
                                className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12" 
                                onClick={hasContent ? handleSend : handleMicClick}
                                disabled={!hasContent && isRecording && !mediaRecorderRef.current}
                            >
                                {hasContent ? <Send /> : (isRecording ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1}}><Square className="fill-white" /></motion.div> : <Mic />) }
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            )}

             {isTyping && !text && (
                <div className="text-xs text-muted-foreground text-center pt-1 animate-pulse">
                    جارِ الكتابة...
                </div>
            )}
        </div>
    );
};

export default React.memo(MessageInput);
