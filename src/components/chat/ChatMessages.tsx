
"use client";

import React, { useEffect, useRef } from 'react';
import type { Message, User } from '@/lib/types';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
        setTimeout(() => {
            if (viewportRef.current) {
                viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
            }
        }, 100);
    }
  }, [messages.length]);


  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="flex flex-col-reverse p-4 md:p-6">
        <div className={cn("flex flex-col gap-1")}>
            {messages.map((message, index) => {
            const nextMessage = messages[index - 1]; // We are reversed
            const prevMessage = messages[index + 1];
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
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
