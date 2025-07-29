"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, PanelRight, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

interface ChatListProps {
  selectedChatId: number | null;
  setSelectedChatId: (id: number) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId, setSelectedChatId, isSidebarOpen, toggleSidebar }) => {
  const { chats } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">المحادثات</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
            {isSidebarOpen ? <PanelRight /> : <PanelLeft />}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors',
                selectedChatId === chat.id
                  ? 'bg-primary/10 text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Avatar>
                <AvatarFallback>{chat.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold truncate">{chat.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                    {chat.messages[chat.messages.length - 1]?.text?.split('\n')[0] || '...'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                <span>{chat.lastMessageTime}</span>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Badge variant="default" className="bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
