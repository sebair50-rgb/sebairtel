
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
import { useAppContext } from '@/store/AppContext';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput, { MessageInputHandles } from './MessageInput';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ChatViewProps {
  chat: Chat;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chat, onBack }) => {
  const { addMessage, currentUser, updateMessage } = useAppContext();
  const { toast } = useToast();
  const [isBlocked, setIsBlocked] = useState(chat.isBlocked || false);
  const [showConfirmation, setShowConfirmation] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const messageInputRef = React.useRef<MessageInputHandles>(null);

  useEffect(() => {
    setIsBlocked(chat.isBlocked || false);
  }, [chat.id, chat.isBlocked]);


  const handleSendMessage = useCallback(async (text: string, options: { type: Message['type'], media?: any }) => {
    if (!currentUser) return;
    if (!text.trim() && !options.media) return;

    if (editingMessage) {
        await updateMessage(chat.id, editingMessage.id, { text });
        setEditingMessage(null);
    } else {
        const newMessageData: Omit<Message, 'id' | 'timestamp' | 'time'> = {
            user: currentUser.name,
            avatar: currentUser.avatar,
            userId: currentUser.id,
            text,
            status: 'sent',
            type: options.type,
            replyTo: replyingToMessage ? replyingToMessage.id : null,
        };

        // Conditionally add media fields to avoid sending `undefined` to Firestore
        if (options.media) {
            newMessageData.src = options.media.src;
            newMessageData.fileInfo = options.media.fileInfo;
        }

        await addMessage(chat.id, newMessageData);
        setReplyingToMessage(null);
    }
  }, [addMessage, currentUser, chat.id, editingMessage, updateMessage, replyingToMessage]);

  const handleEditMessage = (message: Message) => {
    setReplyingToMessage(null);
    setEditingMessage(message);
    messageInputRef.current?.setText(message.text || '');
    messageInputRef.current?.focus();
  }
  
  const handleReplyMessage = (message: Message) => {
    setEditingMessage(null);
    setReplyingToMessage(message);
    messageInputRef.current?.focus();
  }

  const handleMenuAction = (action: 'clear' | 'block') => {
      if(action === 'clear') {
          setShowConfirmation({
              show: true,
              title: 'Clear Conversation',
              message: 'Are you sure you want to clear all messages in this conversation? This action cannot be undone.',
              onConfirm: () => {
                  toast({title: "This feature will be activated soon"});
              },
          });
      } else if(action === 'block') {
           setShowConfirmation({
              show: true,
              title: 'Block User',
              message: `Are you sure you want to block ${chat.name}? You will not be able to send or receive messages from them.`,
              onConfirm: () => {
                  setIsBlocked(true);
                  toast({title: `${chat.name} has been blocked`});
              },
          });
      }
  }

  return (
    <div className="flex flex-col h-full bg-background w-full bg-[url('https://placehold.co/1000x1000/e5ddd5/e5ddd5.png')] bg-center bg-fixed" style={{backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAABCAYAAAA/4QAYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVHjaY/iPY/gfA/WHAFMPAFM2A27sP89VAAAAAElFTkSuQmCC")`}}>
      <ChatHeader chat={chat} onBack={onBack} onMenuAction={handleMenuAction} />
      <ChatMessages
        chatId={chat.id}
        onReply={handleReplyMessage}
        onEditMessage={handleEditMessage}
      />
      {isBlocked ? (
        <div className="text-center p-4 bg-background/80 text-sm text-muted-foreground">
            You have blocked this user.
        </div>
      ) : (
        <>
             <MessageInput
                ref={messageInputRef}
                onSendMessage={handleSendMessage}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
                replyingToMessage={replyingToMessage}
                onCancelReply={() => setReplyingToMessage(null)}
             />
        </>
      )}
       {showConfirmation && (
          <AlertDialog open={showConfirmation.show} onOpenChange={(isOpen) => !isOpen && setShowConfirmation(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{showConfirmation.title}</AlertDialogTitle>

                <AlertDialogDescription>
                  {showConfirmation.message}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowConfirmation(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    showConfirmation.onConfirm();
                    setShowConfirmation(null);
                }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      )}
    </div>
  );
};

export default React.memo(ChatView);
