
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const { chats } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card h-full flex flex-col w-full">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">المحادثات</h2>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            className="pr-10 bg-muted focus-visible:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
            {filteredChats.map(chat => (
                <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                    'w-full grid grid-cols-[auto_1fr] items-center gap-3 p-3 rounded-lg text-right transition-colors',
                    selectedChatId === chat.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                )}
                >
                <div className="relative">
                  <Avatar>
                      <AvatarFallback>{chat.avatar}</AvatarFallback>
                  </Avatar>
                  {/* Online indicator can be added here */}
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <h3 className={cn("font-semibold truncate", selectedChatId === chat.id && "text-primary")}>{chat.name}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{chat.lastMessageTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessageText || '...'}
                        </p>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge variant="default" className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full shrink-0">
                                {chat.unreadCount}
                            </Badge>
                        )}
                    </div>
                </div>
                </button>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
