
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
    // We use a timeout to ensure the DOM has updated before scrolling.
    setTimeout(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }, 0);
  }, [messages]);


  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 md:p-6">
        <div className={cn("flex flex-col-reverse gap-1")}>
            {[...messages].reverse().map((message, index) => {
                const prevMessage = messages[messages.length - index];
                const nextMessage = messages[messages.length - index - 2];
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

export default React.memo(ChatMessages);
