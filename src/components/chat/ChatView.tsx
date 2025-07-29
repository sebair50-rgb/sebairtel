
"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  const { addMessage: contextAddMessage, deleteMessage, currentUser, setChats, updateMessage } = useAppContext();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<Pick<Message, 'type' | 'src' | 'fileInfo'> | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isBlocked, setIsBlocked] = useState(chat.isBlocked || false);
  const [showConfirmation, setShowConfirmation] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  useEffect(() => {
    setIsBlocked(chat.isBlocked || false);
  }, [chat.id, chat.isBlocked]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    setIsTyping(true);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSendMessage = (content?: string) => {
    const textToSend = content || newMessage;
    if (!textToSend.trim() && !attachment) return;

    if (isBlocked) {
      toast({ variant: 'destructive', title: "لا يمكن إرسال الرسالة", description: "لقد قمت بحظر هذا المستخدم." });
      return;
    }
    
    if (editingMessage) {
        updateMessage(chat.id, editingMessage.id, { ...editingMessage, text: textToSend });
        setEditingMessage(null);
    } else {
        let message: Omit<Message, 'id'>;
        const baseMessage = {
          user: currentUser.name,
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          avatar: currentUser.avatar,
          status: 'sent',
          replyTo: replyingTo ? replyingTo.id : null,
          likes: 0,
          isLiked: false,
        };

        if (attachment) {
          message = { ...baseMessage, ...attachment, text: textToSend } as Omit<Message, 'id'>;
        } else {
          message = { ...baseMessage, type: 'text', text: textToSend } as Omit<Message, 'id'>;
        }
        
        contextAddMessage(chat.id, { ...message, id: Date.now() });
    }

    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setNewMessage(message.text || '');
    setReplyingTo(null);
    setAttachment(null);
  }

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  }

  const handleDeleteMessage = (messageId: number) => {
    deleteMessage(chat.id, messageId);
  };
  
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
    <div className="flex flex-col h-full bg-background w-full">
      <ChatHeader chat={chat} onBack={onBack} onMenuAction={handleMenuAction} />
      <ChatMessages
        messages={chat.messages}
        currentUser={currentUser}
        onDeleteMessage={handleDeleteMessage}
        onReply={setReplyingTo}
        onEditMessage={handleEditMessage}
        onLikeMessage={handleLikeMessage}
      />
      {isBlocked ? (
         <div className="p-4 text-center text-sm text-muted-foreground border-t">
           لقد حظرت هذا المستخدم. <button onClick={() => { setIsBlocked(false); setChats(prev => prev.map(c => c.id === chat.id ? {...c, isBlocked: false} : c)); }} className="text-accent hover:underline">إلغاء الحظر</button>
         </div>
      ) : (
        <MessageInput
          newMessage={newMessage}
          handleTyping={handleTyping}
          handleSendMessage={handleSendMessage}
          attachment={attachment}
          setAttachment={setAttachment}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          isTyping={isTyping}
          chat={chat}
          editingMessage={editingMessage}
          cancelEdit={cancelEdit}
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

export default ChatView;
