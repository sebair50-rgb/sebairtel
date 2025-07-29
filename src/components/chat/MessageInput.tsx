
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, ArrowUp, Smile, X, Mic, Brain, Code, Edit } from 'lucide-react';
import type { Chat, Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { smartReplySuggestions } from '@/ai/flows/smart-reply';
import Image from 'next/image';

interface MessageInputProps {
  newMessage: string;
  handleTyping: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (content?: string) => void;
  attachment: Pick<Message, 'type' | 'src' | 'fileInfo'> | null;
  setAttachment: React.Dispatch<React.SetStateAction<Pick<Message, 'type' | 'src' | 'fileInfo'> | null>>;
  replyingTo: Message | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<Message | null>>;
  isTyping: boolean;
  chat: Chat;
  editingMessage: Message | null;
  cancelEdit: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  handleTyping,
  handleSendMessage,
  attachment,
  setAttachment,
  replyingTo,
  setReplyingTo,
  isTyping,
  chat,
  editingMessage,
  cancelEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage?.suggestions) {
          setSuggestions(lastMessage.suggestions);
      } else {
          setSuggestions([]);
      }
  }, [chat.messages]);

  useEffect(() => {
    if (editingMessage && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [editingMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result as string;
      const fileInfo = { name: file.name, size: file.size, type: file.type };
      if (file.type.startsWith('image/')) {
        setAttachment({ type: 'image', src: fileDataUrl, fileInfo });
      } else if (file.type.startsWith('video/')) {
        setAttachment({ type: 'video', src: fileDataUrl, fileInfo });
      } else {
        setAttachment({ type: 'file', src: fileDataUrl, fileInfo });
      }
    };
    reader.readAsDataURL(file);
    if(e.target) e.target.value = ''; // Reset file input
  };
  
  const handleSendCode = () => {
    if (!newMessage.trim()) return;
    const codeMessage = `\`\`\`js\n${newMessage}\n\`\`\``;
    handleSendMessage(codeMessage);
  }

  const generateSuggestions = async () => {
    const lastMessage = chat.messages.filter(m => m.user !== 'أنت').pop();
    if (!lastMessage || !lastMessage.text) {
        toast({variant: "destructive", description: "لا توجد رسالة لتوليد رد عليها."});
        return;
    }
    setIsLoadingSuggestions(true);
    try {
        const result = await smartReplySuggestions({message: lastMessage.text});
        setSuggestions(result.suggestions);
    } catch (error) {
        console.error("Failed to generate smart replies:", error);
        toast({variant: "destructive", title: "خطأ", description: "فشل توليد الردود الذكية."});
    } finally {
        setIsLoadingSuggestions(false);
    }
  };


  return (
    <div className="p-4 border-t bg-card">
      {suggestions.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
              {suggestions.map((s, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => handleSendMessage(s)}>
                      {s}
                  </Button>
              ))}
          </div>
      )}
      {editingMessage && (
        <div className="flex justify-between items-center p-2 mb-2 bg-muted rounded-md text-sm">
            <div className='flex items-center gap-2'>
                <Edit className="w-4 h-4 text-primary" />
                <div>
                    <p className="font-semibold">تعديل رسالة</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{editingMessage.text || 'مرفق'}</p>
                </div>
            </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
            <X size={16} />
          </Button>
        </div>
      )}
      {replyingTo && (
        <div className="flex justify-between items-center p-2 mb-2 bg-muted rounded-md">
          <div className="text-sm">
            <p className="font-semibold">رد على {replyingTo.user}</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{replyingTo.text || 'مرفق'}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
            <X size={16} />
          </Button>
        </div>
      )}
       {attachment && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-muted rounded-md">
           {attachment.type === 'image' && <Image src={attachment.src!} alt={attachment.fileInfo!.name} width={40} height={40} className="rounded-md object-cover" />}
           <p className="text-sm truncate flex-1">{attachment.fileInfo?.name}</p>
           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}><X size={16} /></Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({description: "Emoji picker coming soon!"})}>
            <Smile />
          </Button>
          <Textarea
            ref={textareaRef}
            placeholder="اكتب رسالة..."
            value={newMessage}
            onChange={handleTyping}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-base"
          />
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
            <Paperclip />
          </Button>
        </div>
        <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={handleSendCode} disabled={!newMessage.trim()}>
                <Code />
             </Button>
             <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={generateSuggestions} disabled={isLoadingSuggestions}>
                {isLoadingSuggestions ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> : <Brain />}
             </Button>
             <Button size="icon" className="h-10 w-10 shrink-0" onClick={() => handleSendMessage()}>
                 <ArrowUp />
             </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
