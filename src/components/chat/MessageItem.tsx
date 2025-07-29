
"use client";

import React from 'react';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, CornerDownRight, Download, Edit, MoreHorizontal, Trash2, Heart, Share2 } from 'lucide-react';
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
  onDelete: () => void;
  onReply: () => void;
  onEdit: () => void;
  onLike: () => void;
  allMessages: Message[];
}

const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
  if (status === 'seen') return <CheckCheck size={16} className="text-accent" />;
  if (status === 'delivered') return <CheckCheck size={16} className="text-muted-foreground" />;
  return <Check size={16} className="text-muted-foreground" />;
};

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onDelete, onReply, onEdit, onLike, allMessages }) => {
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

  return (
    <div className={cn("flex items-end gap-3", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="w-8 h-8 self-end">
        <AvatarFallback>{message.avatar}</AvatarFallback>
      </Avatar>
      <div className={cn("group relative max-w-md lg:max-w-lg", isOwnMessage ? "items-end" : "items-start")}>
        <div
          className={cn(
            "p-3 rounded-2xl w-fit",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground border rounded-bl-md"
          )}
        >
          {!isOwnMessage && <p className="text-xs font-semibold mb-1 text-primary">{message.user}</p>}
          
          {repliedToMessage && (
            <div className="p-2 mb-2 border-r-2 border-primary/50 bg-black/10 rounded-md text-sm">
                <p className="font-semibold text-xs">{repliedToMessage.user}</p>
                <p className="opacity-80 truncate">{repliedToMessage.text?.substring(0, 50) || 'مرفق'}</p>
            </div>
          )}

          <MessageContent message={message} />
          {message.likes && message.likes > 0 && (
             <div className={cn(
                 "absolute -bottom-3 rounded-full bg-card border px-1.5 py-0.5 text-xs flex items-center gap-1 shadow-sm",
                 isOwnMessage ? "left-2" : "right-2"
             )}>
                <span>{message.likes}</span>
                <Heart className={cn("w-3 h-3", message.isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
             </div>
          )}
        </div>
        <div className={cn("flex items-center gap-2 mt-1 text-xs text-muted-foreground", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
          <span>{message.time}</span>
          {isOwnMessage && <MessageStatus status={message.status} />}
        </div>
        
        <div className={cn("absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center", isOwnMessage ? "-left-20" : "-right-20")}>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onLike}>
              <Heart size={18} className={cn(message.isLiked && 'fill-red-500 text-red-500', "hover:text-red-500 transition-colors")}/>
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal size={18}/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "start" : "end"}>
                <DropdownMenuItem onClick={onReply}>
                  <CornerDownRight className="ml-2 h-4 w-4" />
                  <span>رد</span>
                </DropdownMenuItem>
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
                {isOwnMessage && message.type === 'text' && (
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
