"use client";

import React from 'react';
import type { Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Video, MoreVertical, Search, BellOff, XCircle, UserX, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';


interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onMenuAction: (action: 'clear' | 'block') => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, onBack, onMenuAction }) => {
  const { toast } = useToast();
  const { setChats } = useAppContext();
  const [isMuted, setIsMuted] = React.useState(chat.isMuted || false);

  const handleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setChats(prev => prev.map(c => c.id === chat.id ? {...c, isMuted: newMutedState} : c));
    toast({ title: newMutedState ? `تم كتم إشعارات ${chat.name}` : `تم إلغاء كتم ${chat.name}` });
  }

  return (
    <div className="flex items-center justify-between p-3 border-b bg-card">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowRight size={20} />
        </Button>
        <Avatar>
          <AvatarFallback>{chat.avatar}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold text-lg">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">متصل الآن</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => toast({ description: "سيتم تفعيل المكالمات الصوتية قريباً" })}>
          <Phone size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => toast({ description: "سيتم تفعيل مكالمات الفيديو قريباً" })}>
          <Video size={20} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast({ description: "سيتم تفعيل البحث قريباً" })}>
              <Search className="ml-2 h-4 w-4" />
              <span>بحث في المحادثة</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMute}>
              <BellOff className="ml-2 h-4 w-4" />
              <span>{isMuted ? 'إلغاء الكتم' : 'كتم الإشعارات'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMenuAction('clear')}>
              <Trash2 className="ml-2 h-4 w-4" />
              <span>مسح المحادثة</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onMenuAction('block')} className="text-destructive focus:text-destructive">
              <UserX className="ml-2 h-4 w-4" />
              <span>حظر المستخدم</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
