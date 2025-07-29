
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
import { useAppContext } from '@/store/AppContext';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
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

  useEffect(() => {
    setIsBlocked(chat.isBlocked || false);
  }, [chat.id, chat.isBlocked]);

  const handleSendMessage = useCallback((text: string, options: { type: Message['type'], media?: any }) => {
    if (!text.trim() && !options.media) return;

    if (editingMessage) {
        updateMessage(chat.id, editingMessage.id, { ...editingMessage, text, type: options.type });
        setEditingMessage(null);
    } else {
        const newMessage: Message = {
            id: Date.now(),
            user: currentUser.name,
            avatar: currentUser.avatar,
            text,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            type: options.type,
            src: options.media?.src,
            fileInfo: options.media?.fileInfo,
        };
        addMessage(chat.id, newMessage);
    }
  }, [addMessage, currentUser, chat.id, editingMessage, updateMessage]);


  const handleDeleteMessage = (messageId: number) => {
    deleteMessage(chat.id, messageId);
  };
  
   const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
  }

  const handleMenuAction = (action: 'clear' | 'block') => {
      if(action === 'clear') {
          setShowConfirmation({
              show: true,
              title: 'مسح المحادثة',
              message: 'هل أنت متأكد أنك تريد مسح جميع الرسائل في هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.',
              onConfirm: () => {
                  setChats(prev => prev.map(c => c.id === chat.id ? {...c, messages: []} : c));
                  toast({title: "تم مسح المحادثة"});
              },
          });
      } else if(action === 'block') {
           setShowConfirmation({
              show: true,
              title: 'حظر المستخدم',
              message: `هل أنت متأكد أنك تريد حظر ${chat.name}؟ لن تتمكن من إرسال أو استقبال رسائل منه.`,
              onConfirm: () => {
                  setIsBlocked(true);
                  setChats(prev => prev.map(c => c.id === chat.id ? {...c, isBlocked: true} : c));
                  toast({title: `تم حظر ${chat.name}`});
              },
          });
      }
  }

    const handleLikeMessage = (messageId: number) => {
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
        messages={chat.messages}
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
