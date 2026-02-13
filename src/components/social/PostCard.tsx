
"use client";

import React, { useState } from 'react';
import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, Flag, Globe, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import { useRouter } from 'next/navigation';
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
import { useTranslation } from '@/store/LanguageContext';
import CodeBlock from '../chat/CodeBlock';
import { Textarea } from '../ui/textarea';
import { formatDistanceToNow } from 'date-fns';


interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { updatePost, currentUser, createNotification, deletePost, startEditPost, addComment } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  if (!currentUser) return null;

  const myReaction = post.reactions?.find(r => r.userId === currentUser.id);
  const isOwnPost = post.userId === currentUser.id;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
        await addComment(post.id, newComment);
        setNewComment('');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Failed to post comment."
        });
    }
  };

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
                message: `<strong>${currentUser.name}</strong> reacted to your post with ${emoji}`,
                fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
                link: `/post/${post.id}`
            })
        }
    }

    updatePost(post.id, { reactions: newReactions });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post by ${post.user}!`);
    toast({ description: "Share link copied!" });
  }

  const handleReport = () => {
    toast({
      title: "Report received",
      description: "Thank you, we will review the post.",
    });
  };
  
  const handleNavigateToProfile = () => {
      if(post.userId) {
          router.push(`/profile/${post.userId}`);
      }
  }
  
  const handleEdit = () => {
    startEditPost(post);
  };
  
  const handleDelete = async () => {
    try {
        await deletePost(post.id);
        toast({ title: "Post deleted successfully" });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete post." });
    }
    setShowDeleteConfirm(false);
  };
  
  const getReactionSummary = () => {
    const total = post.reactions?.length || 0;
    if (total === 0) return null;

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center -space-x-1">
                 <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary border-2 border-background">
                    <ThumbsUp size={12} className="text-white"/>
                 </div>
                 <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 border-2 border-background">
                    <Heart size={12} className="text-white fill-white"/>
                 </div>
            </div>
            <span className="text-sm">{total.toLocaleString()}</span>
        </div>
    );
  }

  const isCodePost = post.mediaType === 'code' || (post.content.includes('```') && !post.mediaSrc);
  const timeAgo = post.timestamp ? formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true }) : post.time;


  return (
    <>
    <Card className="overflow-hidden bg-card shadow-sm border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleNavigateToProfile}>
            <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user?.charAt(0)}</AvatarFallback>
            </Avatar>
             <div className="flex-1 text-left">
                <p className="font-bold">{post.user}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{timeAgo}</span>
                    <Globe size={12} />
                </div>
            </div>
        </div>
        
        <div className="flex items-center">
            <Button variant="link" className="text-primary font-bold px-2">Follow</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isOwnPost ? (
                        <>
                            <DropdownMenuItem onClick={handleEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Post</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Post</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    ) : (
                         <DropdownMenuItem onClick={handleReport}>
                            <Flag className="mr-2 h-4 w-4" />
                            <span>Report Post</span>
                        </DropdownMenuItem>
                    )}
                     <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isCodePost ? (
            <div className="px-4 pb-2">
                <CodeBlock code={post.content} />
            </div>
        ) : (
            <>
                <p className="whitespace-pre-wrap px-4 pb-2">{post.content}</p>
                {post.mediaSrc && (
                    <div className="bg-black flex items-center justify-center">
                        {post.mediaType === 'image' ? (
                            <Image src={post.mediaSrc} alt="Post media" width={600} height={600} className="w-full h-auto max-h-[70vh] object-contain" />
                        ) : (
                            <video src={post.mediaSrc} controls className="w-full h-auto max-h-[70vh]" />
                        )}
                    </div>
                )}
            </>
        )}
      </CardContent>

      <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-500">
        {getReactionSummary()}
        <div className="flex gap-4">
            <span>{post.comments?.length || 0} Comments</span>
            <span>{Math.floor(Math.random() * 50)} Shares</span>
        </div>
      </div>
      
      <div className="flex justify-around items-center text-muted-foreground border-t p-1">
          <Button variant="ghost" size="lg" className={cn("w-full flex items-center gap-2", myReaction?.emoji === '👍' && 'text-blue-600 font-bold')} onClick={() => handleReaction('👍')}>
              <ThumbsUp />
              <span className="text-sm">Like</span>
          </Button>

          <Button variant="ghost" size="lg" className="w-full flex items-center gap-2" onClick={() => setShowComments(!showComments)}>
              <MessageCircle />
              <span className="text-sm">Comment</span>
          </Button>
          
          <Button variant="ghost" size="lg" className="w-full flex items-center gap-2" onClick={handleShare}>
              <Share2 />
              <span className="text-sm">Share</span>
          </Button>
      </div>

       {showComments && (
        <CardContent className="p-4 border-t bg-slate-50 dark:bg-black/20">
            <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full flex items-start gap-2">
                    <Textarea 
                        placeholder="Write a comment..." 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-background"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>Post</Button>
                </div>
            </div>
            <div className="space-y-4">
                {[...(post.comments || [])].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()).map((comment, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="bg-background border p-3 rounded-lg w-full">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">{comment.user}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true })}</p>
                            </div>
                            <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                    </div>
                ))}
                {(!post.comments || post.comments.length === 0) && (
                    <p className="text-muted-foreground text-center text-sm py-4">No comments yet. Be the first to comment!</p>
                )}
            </div>
        </CardContent>
      )}
    </Card>

     <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete this post and cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default PostCard;
