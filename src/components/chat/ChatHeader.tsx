
"use client";

import React from 'react';
import type { Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Video, MoreVertical, Search, BellOff, Trash2, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import useIsMobile from '@/hooks/use-is-mobile';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onMenuAction: (action: 'clear' | 'block') => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, onBack, onMenuAction }) => {
  const { toast } = useToast();
  const { setChats, initiateCall, friends, currentUser, users } = useAppContext();
  const [isMuted, setIsMuted] = React.useState(chat.isMuted || false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setChats(prev => prev.map(c => c.id === chat.id ? {...c, isMuted: newMutedState} : c));
    toast({ title: newMutedState ? `تم كتم إشعارات ${chat.name}` : `تم إلغاء كتم ${chat.name}` });
  }

  const friendId = chat.users.find(uid => uid !== currentUser?.id);
  const friend = users.find(u => u.id === friendId) || friends.find(f => f.id === friendId);
  
  const handleNavigateToProfile = () => {
    if (friendId) {
        router.push(`/profile/${friendId}`);
    }
  };

  const handleCall = (type: 'audio' | 'video') => {
      if(friend) {
        initiateCall(friend, type);
      } else {
          toast({ variant: 'destructive', description: "لم يتم العثور على المستخدم لبدء المكالمة." });
      }
  }
  
  const getStatus = () => {
    if (!friend) return null;
    if (friend.isOnline) return "متصل الآن";
    if (friend.lastSeen) {
        return `آخر ظهور ${formatDistanceToNow(friend.lastSeen.toDate(), { addSuffix: true, locale: ar })}`;
    }
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 border-b bg-card">
      <div className="flex items-center gap-3">
        {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowRight size={20} />
            </Button>
        )}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleNavigateToProfile}>
          <Avatar>
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold text-lg truncate">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">{getStatus()}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleCall('audio')}>
          <Phone size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleCall('video')}>
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
