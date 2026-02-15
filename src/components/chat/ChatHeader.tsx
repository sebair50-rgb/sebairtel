"use client";

import React from 'react';
import type { Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, MoreVertical, Search, BellOff, Trash2, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
    toast({ title: newMutedState ? `Muted notifications for ${chat.name}` : `Unmuted ${chat.name}` });
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
          toast({ variant: 'destructive', description: "User not found to start the call." });
      }
  }
  
  const getStatus = () => {
    if (!friend) return null;
    if (friend.isOnline) return "Online now";
    if (friend.lastSeen) {
        return `Last seen ${formatDistanceToNow(friend.lastSeen.toDate(), { addSuffix: true, locale: enUS })}`;
    }
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 border-b bg-card">
      <div className="flex items-center gap-3">
        {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
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
            <DropdownMenuItem onClick={() => toast({ description: "Search will be activated soon" })}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search in Conversation</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMute}>
              <BellOff className="mr-2 h-4 w-4" />
              <span>{isMuted ? 'Unmute' : 'Mute Notifications'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMenuAction('clear')}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear Conversation</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onMenuAction('block')} className="text-destructive focus:text-destructive">
              <UserX className="mr-2 h-4 w-4" />
              <span>Block User</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
