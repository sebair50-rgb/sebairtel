
"use client";

import React, { useEffect, useRef } from 'react';
import type { Message, User } from '@/lib/types';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessagesProps {
  messages: Message[];
  currentUser: User;
  onDeleteMessage: (messageId: number) => void;
  onReply: (message: Message) => void;
  onEditMessage: (message: Message) => void;
  onLikeMessage: (messageId: number) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUser, onDeleteMessage, onReply, onEditMessage, onLikeMessage }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(scrollViewport) {
             scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 md:p-6 flex flex-col-reverse gap-1">
        {messages.slice().reverse().map((message, index) => {
          const originalIndex = messages.length - 1 - index;
          const prevMessage = messages[originalIndex - 1];
          const nextMessage = messages[originalIndex + 1];
          const isOwnMessage = message.user === currentUser.name;

          const isFirstInGroup = !nextMessage || nextMessage.user !== message.user;
          const isLastInGroup = !prevMessage || prevMessage.user !== message.user;

          return (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              onDelete={() => onDeleteMessage(message.id)}
              onReply={() => onReply(message)}
              onEdit={() => onEditMessage(message)}
              onLike={() => onLikeMessage(message.id)}
              allMessages={messages}
            />
          )
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
