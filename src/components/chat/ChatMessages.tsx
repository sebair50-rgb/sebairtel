
"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { Message, User } from '@/lib/types';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppContext } from '@/store/AppContext';

interface ChatMessagesProps {
  chatId: string;
  onReply: (message: Message) => void;
  onEditMessage: (message: Message) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatId, onReply, onEditMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { currentUser, deleteMessage, updateMessage } = useAppContext();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!chatId) return;

      const messagesColRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesColRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to JS Date, then to string for MessageItem
                time: data.timestamp?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
              } as Message
          });
          setMessages(fetchedMessages);
      });
      
      return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    setTimeout(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }, 100);
  }, [messages]);

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(chatId, messageId);
  };

  const handleLikeMessage = (messageId: string) => {
      const message = messages.find(m => m.id === messageId);
      if (message && currentUser) {
          const isLiked = !(message.likedBy?.includes(currentUser.id));
          let newLikedBy = message.likedBy || [];
          if(isLiked) {
              newLikedBy.push(currentUser.id);
          } else {
              newLikedBy = newLikedBy.filter(id => id !== currentUser.id);
          }
          updateMessage(chatId, messageId, { likedBy: newLikedBy });
      }
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

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
                        onDelete={() => handleDeleteMessage(message.id)}
                        onReply={() => onReply(message)}
                        onEdit={() => onEditMessage(message)}
                        onLike={() => handleLikeMessage(message.id)}
                        allMessages={messages}
                        currentUser={currentUser}
                    />
                )
            })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default React.memo(ChatMessages);
