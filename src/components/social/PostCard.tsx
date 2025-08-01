
"use client";

import React, { useState } from 'react';
import type { Post, Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';


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
  const { updatePost, currentUser, createNotification, addComment } = useAppContext();
  const [isSaved, setIsSaved] = React.useState(post.isSaved);
  const router = useRouter();

  if (!currentUser) return null;

  const isLiked = post.likedBy?.includes(currentUser.id) || false;

  const handleLike = () => {
      let newLikedBy = post.likedBy || [];
      const wasLiked = isLiked;

      if (wasLiked) {
          newLikedBy = newLikedBy.filter(id => id !== currentUser.id);
      } else {
          newLikedBy.push(currentUser.id);
          if (post.userId !== currentUser.id) {
            createNotification(post.userId, {
                type: 'like',
                message: `أعجب <strong>${currentUser.name}</strong> بمنشورك.`,
                fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
                link: `/post/${post.id}`
            })
          }
      }
      updatePost(post.id, { likedBy: newLikedBy });
  }

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleNavigateToProfile}>
            <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-bold">{post.user}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media && (
          <div className="mt-4 rounded-lg overflow-hidden border">
             {post.media.type === 'image' ? (
                <Image src={post.media.src} alt="Post media" width={600} height={400} className="w-full h-auto object-cover" />
             ) : (
                <video src={post.media.src} controls className="w-full h-auto bg-black" />
             )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-muted-foreground">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike}>
            <Heart size={18} className={cn(isLiked && 'fill-red-500 text-red-500')} />
            <span className="text-sm">{post.likedBy?.length || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments.length}</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="flex items-center gap-2" onClick={handleShare}>
              <Share2 size={18} />
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
          <AccordionTrigger className="p-4 pt-0 text-sm font-semibold text-muted-foreground hover:no-underline">
              {post.comments.length > 0 ? `عرض كل التعليقات (${post.comments.length})` : 'أضف تعليقًا'}
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default PostCard;
