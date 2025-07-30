
"use client";

import React from 'react';
import type { Message, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, Download, Edit, MoreHorizontal, Trash2, Heart, Share2, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onDelete: () => void;
  onReply: () => void;
  onEdit: () => void;
  onLike: () => void;
  allMessages: Message[];
  currentUser: User;
}

const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
  if (status === 'seen') return <CheckCheck size={16} className="text-blue-500" />;
  if (status === 'delivered') return <CheckCheck size={16} className="text-muted-foreground" />;
  return <Check size={16} className="text-muted-foreground" />;
};

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onDelete, onReply, onEdit, onLike, allMessages, currentUser }) => {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!message.src || !message.fileInfo) return;
    const a = document.createElement('a');
    a.href = message.src;
    a.download = message.fileInfo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    let shareContent = message.text || '';
    if (message.type === 'image' || message.type === 'video' || message.type === 'file') {
        shareContent = `[مرفق: ${message.fileInfo?.name}] ${message.text || ''}`.trim();
    }
    navigator.clipboard.writeText(shareContent);
    toast({ description: "تم نسخ محتوى الرسالة!" });
  }

  const repliedToMessage = message.replyTo ? allMessages.find(m => m.id === message.replyTo) : null;
  const isLiked = message.likedBy?.includes(currentUser.id) || false;

  return (
    <div className={cn(
        "flex items-end gap-1.5 group w-full", 
        isOwnMessage ? "flex-row-reverse" : "flex-row",
    )}>
      <div className={cn(
          "relative flex flex-col max-w-[80%] lg:max-w-[70%]",
           isOwnMessage ? "items-end" : "items-start"
      )}>
        <div
          id={`message-${message.id}`}
          className={cn(
            "p-2 w-fit min-w-[80px] relative overflow-hidden",
            isOwnMessage
              ? "bg-[#D9FDD3] text-black"
              : "bg-white text-black",
            'rounded-lg',
          )}
        >
          
          {repliedToMessage && (
            <a href={`#message-${repliedToMessage.id}`} className="block p-2 mb-2 border-r-2 border-primary/50 bg-black/5 dark:bg-black/20 rounded-lg text-sm transition-colors hover:bg-black/10">
                <p className="font-semibold text-xs text-primary">{repliedToMessage.user}</p>
                <p className="opacity-80 truncate max-w-[200px]">{repliedToMessage.text?.substring(0, 50) || 'مرفق'}</p>
            </a>
          )}

          <MessageContent message={message} isOwnMessage={isOwnMessage} />

          <div className="float-right flex items-center gap-1.5 mt-1 ml-4" style={{direction: "ltr"}}>
            <span className="text-xs text-muted-foreground">{message.time}</span>
            {isOwnMessage && <MessageStatus status={message.status} />}
          </div>

          {(message.likedBy?.length || 0) > 0 && (
             <div className={cn(
                 "absolute -bottom-3 rounded-full bg-card border px-1.5 py-0.5 text-xs flex items-center gap-1 shadow-sm z-10",
                 isOwnMessage ? "left-2" : "right-2"
             )}>
                <Heart className={cn("w-3 h-3", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
                <span>{message.likedBy?.length}</span>
             </div>
          )}
        </div>
        
        <div className={cn("absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center z-20 bg-card/80 backdrop-blur-sm rounded-full border shadow-sm", isOwnMessage ? "-left-[8rem] md:-left-[8.5rem]" : "-right-[8rem] md:-right-[8.5rem]")}>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onLike}>
              <Heart size={16} className={cn(isLiked && 'fill-red-500 text-red-500', "hover:text-red-500 transition-colors")}/>
           </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onReply}>
                <Reply size={16} />
            </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal size={16}/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "start" : "end"}>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="ml-2 h-4 w-4" />
                  <span>مشاركة</span>
                </DropdownMenuItem>
                {(message.type === 'image' || message.type === 'video' || message.type === 'file') && (
                    <DropdownMenuItem onClick={handleDownload}>
                        <Download className="ml-2 h-4 w-4" />
                        <span>تنزيل</span>
                    </DropdownMenuItem>
                )}
                {isOwnMessage && (message.type === 'text' || message.text) && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="ml-2 h-4 w-4" />
                    <span>تعديل</span>
                  </DropdownMenuItem>
                )}
                {isOwnMessage && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="ml-2 h-4 w-4" />
                    <span>حذف</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
