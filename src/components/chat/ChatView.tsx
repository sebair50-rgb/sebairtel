
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { Chat, Message, User } from '@/lib/types';
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
  const { addMessage, deleteMessage, currentUser, setChats, updateMessage } = useAppContext();
  const { toast } = useToast();
  const [isBlocked, setIsBlocked] = useState(chat.isBlocked || false);
  const [showConfirmation, setShowConfirmation] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messageInputRef = React.useRef<MessageInputHandles>(null);

  useEffect(() => {
    setIsBlocked(chat.isBlocked || false);
  }, [chat.id, chat.isBlocked]);

    const handleSendMessage = useCallback(async (text: string, options: { type: Message['type'], media?: any }) => {
    if (!currentUser) return;
    if (!text.trim() && !options.media) return;

    if (editingMessage) {
        await updateMessage(chat.id, editingMessage.id, { ...editingMessage, text });
        setEditingMessage(null);
    } else {
        const newMessageData: Omit<Message, 'id' | 'timestamp' | 'time'> = {
            user: currentUser.name,
            avatar: currentUser.avatar,
            text,
            status: 'sent',
            type: options.type,
            src: options.media?.src,
            fileInfo: options.media?.fileInfo,
        };
        await addMessage(chat.id, newMessageData);
    }
  }, [addMessage, currentUser, chat.id, editingMessage, updateMessage]);


  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(chat.id, messageId);
  };
  
   const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    messageInputRef.current?.setText(message.text || '');
  }

  const handleMenuAction = (action: 'clear' | 'block') => {
      if(action === 'clear') {
          setShowConfirmation({
              show: true,
              title: 'مسح المحادثة',
              message: 'هل أنت متأكد أنك تريد مسح جميع الرسائل في هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.',
              onConfirm: () => {
                  // This is now a more complex operation with subcollections.
                  // For now, we'll just toast a message.
                  toast({title: "سيتم تفعيل هذه الميزة قريباً"});
              },
          });
      } else if(action === 'block') {
           setShowConfirmation({
              show: true,
              title: 'حظر المستخدم',
              message: `هل أنت متأكد أنك تريد حظر ${chat.name}؟ لن تتمكن من إرسال أو استقبال رسائل منه.`,
              onConfirm: () => {
                  setIsBlocked(true);
                  // Update chat doc in firestore
                  toast({title: `تم حظر ${chat.name}`});
              },
          });
      }
  }

    const handleLikeMessage = (messageId: string) => {
        const message = chat.messages.find(m => m.id === messageId);
        if (message) {
            const isLiked = !message.isLiked;
            const likes = isLiked ? (message.likes || 0) + 1 : (message.likes || 1) - 1;
            updateMessage(chat.id, messageId, { ...message, isLiked, likes });
        }
    }

  return (
    <div className="flex flex-col h-full bg-background w-full bg-[url('https://placehold.co/1000x1000/e5ddd5/e5ddd5.png')] bg-center bg-fixed" style={{backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAABCAYAAAA/4QAYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVHjaY/iPY/gfA/WHAFMPAFM2A27sP89VAAAAAElFTkSuQmCC")`}}>
      <ChatHeader chat={chat} onBack={onBack} onMenuAction={handleMenuAction} />
      <ChatMessages
        chatId={chat.id}
        currentUser={currentUser}
        onDeleteMessage={handleDeleteMessage}
        onReply={() => {}}
        onEditMessage={handleEditMessage}
        onLikeMessage={handleLikeMessage}
      />
      {isBlocked ? (
        <div className="text-center p-4 bg-background/80 text-sm text-muted-foreground">
            لقد قمت بحظر هذا المستخدم.
        </div>
      ) : (
         <MessageInput
            ref={messageInputRef}
            onSendMessage={handleSendMessage}
            editingMessage={editingMessage}
            onCancelEdit={() => setEditingMessage(null)}
         />
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
                <AlertDialogCancel onClick={() => setShowConfirmation(null)}>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    showConfirmation.onConfirm();
                    setShowConfirmation(null);
                }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  تأكيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      )}
    </div>
  );
};

export default React.memo(ChatView);
