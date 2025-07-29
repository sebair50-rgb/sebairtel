
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, ArrowUp, Smile, X, Mic, Brain, Edit, Reply, File, Image as ImageIcon, Code } from 'lucide-react';
import type { Chat, Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { smartReplySuggestions } from '@/ai/flows/smart-reply';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';


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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isAttachmentPopoverOpen, setIsAttachmentPopoverOpen] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result as string;
      const fileInfo = { name: file.name, size: file.size, type: file.type };
      if (type === 'image' && file.type.startsWith('image/')) {
        setAttachment({ type: 'image', src: fileDataUrl, fileInfo });
      } else if (type === 'image' && file.type.startsWith('video/')) {
         setAttachment({ type: 'video', src: fileDataUrl, fileInfo });
      } else {
        setAttachment({ type: 'file', src: fileDataUrl, fileInfo });
      }
    };
    reader.readAsDataURL(file);
    if(e.target) e.target.value = ''; // Reset file input
    setIsAttachmentPopoverOpen(false);
  };
  
  const handleCodeSend = () => {
    const codeTemplate = '```javascript\n\n```';
    if(textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const newText = text.substring(0, start) + codeTemplate + text.substring(end);
        
        // Directly manipulating the textarea value and dispatching an event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        nativeInputValueSetter?.call(textareaRef.current, newText);
        
        const event = new Event('input', { bubbles: true });
        textareaRef.current.dispatchEvent(event);
        
        // Set cursor position
        const cursorPosition = start + '```javascript\n'.length;
        textareaRef.current.focus();
        setTimeout(() => {
             textareaRef.current?.setSelectionRange(cursorPosition, cursorPosition);
        }, 0)
    }
    setIsAttachmentPopoverOpen(false);
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

  const onSendMessage = () => {
    handleSendMessage(newMessage);
    setSuggestions([]);
  }

  const showSendButton = newMessage.trim() || attachment;

  return (
    <div className="p-2 md:p-4 border-t bg-card flex flex-col gap-2">
       {suggestions.length > 0 && !showSendButton && (
          <div className="flex gap-2 flex-wrap px-2">
              {suggestions.map((s, i) => (
                  <Button key={i} variant="outline" size="sm" className="rounded-full" onClick={() => handleSendMessage(s)}>
                      {s}
                  </Button>
              ))}
          </div>
      )}

      {(editingMessage || replyingTo || attachment) && (
        <div className="p-2 mx-2 bg-muted/50 rounded-lg border">
            {editingMessage && (
                <div className="flex justify-between items-center text-sm">
                    <div className='flex items-center gap-2 text-primary overflow-hidden'>
                        <Edit className="w-4 h-4 flex-shrink-0" />
                        <div className='flex-1 overflow-hidden'>
                            <p className="font-semibold">تعديل رسالة</p>
                            <p className="text-xs text-muted-foreground truncate">{editingMessage.text || 'مرفق'}</p>
                        </div>
                    </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                    <X size={16} />
                  </Button>
                </div>
            )}
             {replyingTo && (
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-primary overflow-hidden">
                        <Reply className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold">رد على {replyingTo.user}</p>
                            <p className="text-xs text-muted-foreground truncate">{replyingTo.text || 'مرفق'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                        <X size={16} />
                    </Button>
                </div>
            )}
            {attachment && (
                <div className="flex items-center gap-2 p-2 mt-2 bg-background rounded-md">
                   {attachment.type === 'image' && <Image src={attachment.src!} alt={attachment.fileInfo!.name} width={40} height={40} className="rounded-md object-cover" />}
                   {attachment.type !== 'image' && <File className="w-8 h-8 text-muted-foreground" />}
                   <p className="text-sm truncate flex-1">{attachment.fileInfo?.name}</p>
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}><X size={16} /></Button>
                </div>
            )}
        </div>
      )}

      <div className="flex items-end gap-2">
         <div className="flex-1 flex items-end gap-2 bg-muted rounded-xl p-1">
            <div className="flex items-center self-end">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast({description: "Emoji picker coming soon!"})}>
                 <Smile />
                </Button>
                <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*,video/*" className="hidden" />
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'file')} className="hidden" />
                 <Popover open={isAttachmentPopoverOpen} onOpenChange={setIsAttachmentPopoverOpen}>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className={cn("h-9 w-9", showSendButton && "hidden")}>
                            <Paperclip />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1 mb-2">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => imageInputRef.current?.click()}>
                           <ImageIcon className="ml-2"/> صورة أو فيديو
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                           <File className="ml-2"/> ملف
                        </Button>
                         <Button variant="ghost" className="w-full justify-start" onClick={handleCodeSend}>
                           <Code className="ml-2"/> كود
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
           <Textarea
             ref={textareaRef}
             placeholder="اكتب رسالة..."
             value={newMessage}
             onChange={handleTyping}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 onSendMessage();
               }
             }}
             className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-base shadow-none"
           />
           <div className="flex items-center self-end">
             <Button variant="ghost" size="icon" className={cn("h-9 w-9", showSendButton && "hidden")} onClick={() => toast({description: "Voice messages coming soon!"})}>
                <Mic />
            </Button>
           </div>
         </div>
         <div className="flex items-center gap-1 self-end">
             {showSendButton ? (
                <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full"
                    onClick={onSendMessage}
                >
                    <ArrowUp />
                </Button>
             ) : (
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={generateSuggestions} disabled={isLoadingSuggestions}>
                    {isLoadingSuggestions ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> : <Brain />}
                </Button>
             )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

    