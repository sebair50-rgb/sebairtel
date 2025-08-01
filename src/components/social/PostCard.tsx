
"use client";

import React, { useState } from 'react';
import type { Post, Comment, Reaction } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal, Trash2, Edit, Copy, Flag, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const ReactionPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const reactions = ['❤️', '👍', '😂', '😯', '😢', '😠'];
    return (
        <div className="flex gap-1 bg-card p-2 rounded-full shadow-lg border">
            {reactions.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="text-2xl p-1 rounded-full hover:bg-muted transition-transform hover:scale-125"
                >
                    {emoji}
                </button>
            ))}
        </div>
    )
};


interface CommentInputProps {
  postId: string;
}

const CommentInput: React.FC<CommentInputProps> = ({ postId }) => {
    const [commentText, setCommentText] = useState('');
    const { addComment, currentUser } = useAppContext();

    const handleAddComment = () => {
        if (!commentText.trim() || !currentUser) return;
        addComment(postId, commentText);
        setCommentText('');
    };

    return (
        <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Input 
                placeholder="اكتب تعليقًا..." 
                className="flex-1"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()}>
                <Send />
            </Button>
        </div>
    );
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { toast } = useToast();
  const { updatePost, currentUser, createNotification, deletePost } = useAppContext();
  const [isSaved, setIsSaved] = React.useState(post.isSaved);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const router = useRouter();

  if (!currentUser) return null;

  const myReaction = post.reactions?.find(r => r.userId === currentUser.id);
  const isOwnPost = post.userId === currentUser.id;

  const handleReaction = (emoji: string) => {
    let newReactions = post.reactions ? [...post.reactions] : [];
    const existingReactionIndex = newReactions.findIndex(r => r.userId === currentUser.id);

    if (existingReactionIndex > -1) {
        if (newReactions[existingReactionIndex].emoji === emoji) {
            newReactions.splice(existingReactionIndex, 1);
        } else {
            newReactions[existingReactionIndex].emoji = emoji;
        }
    } else {
        newReactions.push({ userId: currentUser.id, emoji });
        if (!isOwnPost) {
             createNotification(post.userId, {
                type: 'reaction',
                message: `تفاعل <strong>${currentUser.name}</strong> مع منشورك بـ ${emoji}`,
                fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
                link: `/post/${post.id}`
            })
        }
    }

    updatePost(post.id, { reactions: newReactions });
  };


  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({ description: !isSaved ? "تم حفظ المنشور!" : "تمت إزالة الحفظ!" });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post by ${post.user}!`);
    toast({ description: "تم نسخ رابط المشاركة!" });
  }
  
  const handleNavigateToProfile = () => {
      if(post.userId) {
          router.push(`/profile/${post.userId}`);
      }
  }
  
  const formatCommentTime = (timestamp: any) => {
    if (!timestamp) return "";
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ar });
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ description: "تم نسخ رابط المنشور!" });
  };

  const handleReport = () => {
    toast({ title: "تم استلام بلاغك", description: "شكرًا لك، سنقوم بمراجعة المنشور." });
  };
  
  const handleEdit = () => {
    setEditedContent(post.content);
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleUpdatePost = async () => {
    if (editedContent.trim() === '') {
        toast({ variant: 'destructive', description: 'لا يمكن أن يكون المنشور فارغًا.' });
        return;
    }
    try {
        await updatePost(post.id, { content: editedContent });
        setIsEditing(false);
        toast({ description: 'تم تحديث المنشور بنجاح.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث المنشور.' });
    }
  };

  const handleDelete = async () => {
    try {
        await deletePost(post.id);
        toast({ title: "تم حذف المنشور بنجاح" });
    } catch (error) {
        toast({ variant: 'destructive', title: "خطأ", description: "فشل حذف المنشور." });
    }
  };
  
  const getReactionSummary = () => {
    const reactionCounts: {[key: string]: number} = {};
    if (!post.reactions) return null;
    post.reactions.forEach(r => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    const sortedReactions = Object.entries(reactionCounts).sort(([,a],[,b]) => b-a);
    const total = post.reactions.length;

    if (total === 0) return null;

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground p-2">
            <div className="flex items-center -space-x-2">
                 {sortedReactions.slice(0, 3).map(([emoji]) => (
                    <span key={emoji} className="text-sm border-2 border-background rounded-full bg-card p-0.5">{emoji}</span>
                 ))}
            </div>
            <span>{total}</span>
        </div>
    );
  }

  return (
    <>
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={handleNavigateToProfile}>
            <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-bold">{post.user}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {isOwnPost && (
                    <>
                        <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="ml-2 h-4 w-4" />
                            <span>تعديل المنشور</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                            <Trash2 className="ml-2 h-4 w-4" />
                            <span>حذف المنشور</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                 <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="ml-2 h-4 w-4" />
                    <span>نسخ الرابط</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>
                    <Flag className="ml-2 h-4 w-4" />
                    <span>الإبلاغ عن المنشور</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isEditing ? (
            <div className="space-y-2">
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancelEdit}>إلغاء</Button>
                    <Button onClick={handleUpdatePost}>حفظ</Button>
                </div>
            </div>
        ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
        )}

        {post.mediaSrc && !isEditing && (
          <div className="mt-4 rounded-lg overflow-hidden border">
             {post.mediaType === 'image' ? (
                <Image src={post.mediaSrc} alt="Post media" width={600} height={400} className="w-full h-auto object-cover" />
             ) : (
                <video src={post.mediaSrc} controls className="w-full h-auto bg-black" />
             )}
          </div>
        )}
      </CardContent>

      {!isEditing && getReactionSummary()}

      {!isEditing && (
        <>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-muted-foreground border-t mt-2">
                <div className="flex items-center gap-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", myReaction && 'text-primary font-bold')}>
                            {myReaction ? <span className="text-lg">{myReaction.emoji}</span> : <Smile size={18} />}
                            <span className="text-sm">{myReaction ? 'تفاعلت' : 'تفاعل'}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto bg-transparent border-none shadow-none">
                        <ReactionPicker onSelect={handleReaction} />
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    <span className="text-sm">تعليق</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleShare}>
                    <Share2 size={18} />
                    <span className="text-sm">مشاركة</span>
                </Button>

                </div>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                <Bookmark size={18} className={cn(isSaved && 'fill-primary text-primary')} />
                </Button>
            </CardFooter>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-t">
                <AccordionContent className="p-4">
                    <div className="space-y-4">
                        {post.comments.length > 0 ? (
                            post.comments.map((comment, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.avatar} alt={comment.user} />
                                        <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted p-3 rounded-lg w-full">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm">{comment.user}</p>
                                            <p className="text-xs text-muted-foreground">{formatCommentTime(comment.timestamp)}</p>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                        )}
                    </div>
                    <CommentInput postId={post.id} />
                </AccordionContent>
                {post.comments.length > 0 && (
                    <AccordionTrigger className="p-4 pt-0 text-sm font-semibold text-muted-foreground hover:no-underline">
                        {`عرض كل التعليقات (${post.comments.length})`}
                    </AccordionTrigger>
                )}
                </AccordionItem>
            </Accordion>
        </>
      )}
    </Card>
     <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
                سيتم حذف هذا المنشور بشكل دائم ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                حذف
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default PostCard;
