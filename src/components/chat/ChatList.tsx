
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const { chats, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-100 h-full flex flex-col w-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="بحث في المحادثات..."
            className="w-full rounded-full bg-white h-12 pr-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
            {filteredChats.map(chat => {
                const unreadCount = currentUser ? chat.unreadCount?.[currentUser.id] || 0 : 0;
                return (
                    <Card
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                            'w-full p-2 rounded-xl shadow-sm transition-all cursor-pointer border-2',
                            selectedChatId === chat.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white hover:border-primary/50'
                        )}
                    >
                        <div className="grid grid-cols-[auto_1fr] items-center gap-3 text-right">
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={chat.avatar} alt={chat.name} />
                                    <AvatarFallback>{chat.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="min-w-0 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <h3 className={cn("font-bold truncate", selectedChatId === chat.id && "text-primary")}>{chat.name}</h3>
                                    <span className="text-xs text-muted-foreground shrink-0">{chat.lastMessageTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground truncate">
                                        {chat.lastMessageText || '...'}
                                    </p>
                                    {unreadCount > 0 && (
                                        <Badge variant="default" className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full shrink-0">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
