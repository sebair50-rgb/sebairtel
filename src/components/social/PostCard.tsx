
"use client";

import React, { useState } from 'react';
import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, Flag, Globe } from 'lucide-react';
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

const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
        <path d="M21.3,10.21,16.83,5.74a2,2,0,0,0-2.83,0l-1.4,1.4a1,1,0,0,1-1.41,0l-1-1a1,1,0,0,0-1.41,0l-1,1a1,1,0,0,1-1.41,0L6,5.41a2,2,0,0,0-2.83,0L2.7,5.87A1,1,0,0,0,2.7,7.3L4,8.59l-.29.29a1,1,0,0,0,0,1.41l1.41,1.41a1,1,0,0,0,1.41,0l.29-.29,1.41,1.41a1,1,0,0,0,1.41,0l1-1a1,1,0,0,1,1.41,0l1,1a1,1,0,0,0,1.41,0l.29-.29,1.41,1.41a1,1,0,0,0,1.41,0l1.41-1.41,2.83-2.83A1,1,0,0,0,21.3,10.21ZM5.83,18.59a2,2,0,0,0,2.83,0l1.41-1.41,1.41,1.41a2,2,0,0,0,2.83,0l1.41-1.41,1.41,1.41a2,2,0,0,0,2.83,0l1.41-1.41,1-1.2-7.5-7.5L5.12,17.39Z" />
    </svg>
);


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
    if (!post.reactions || post.reactions.length === 0) return null;

    const reactionCounts: { [key: string]: number } = {};
    post.reactions.forEach(r => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    const total = post.reactions.length;

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
             <div className="flex items-center">
                <Heart width={16} height={16} className="text-red-500 fill-current" />
                <div className="ml-1 text-sm text-gray-500">
                    {total.toLocaleString()}
                </div>
            </div>
        </div>
    );
  }

  const isCodePost = post.mediaType === 'code' || (post.content.includes('```') && !post.mediaSrc);

  return (
    <>
    <Card className="overflow-hidden bg-card shadow-sm border rounded-lg">
      <CardHeader className="flex flex-row-reverse items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleNavigateToProfile}>
             <div className="flex-1 text-right">
                <p className="font-bold">{post.user}</p>
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    <span>{post.time}</span>
                    <Globe size={12} />
                </div>
            </div>
            <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user?.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        
        <div className="flex items-center">
            <Button variant="ghost" className="text-primary font-bold">Follow</Button>
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
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Post</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Post</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReport}>
                        <Flag className="mr-2 h-4 w-4" />
                        <span>Report Post</span>
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
          <Button variant="ghost" size="lg" className={cn("w-full flex items-center gap-2", myReaction && 'text-blue-600 font-bold')} onClick={() => handleReaction('like')}>
              <ThumbsUpIcon />
              <span className="text-sm">Like</span>
          </Button>

          <Button variant="ghost" size="lg" className="w-full flex items-center gap-2" onClick={() => setShowComments(!showComments)}>
              <MessageCircle size={20} />
              <span className="text-sm">Comment</span>
          </Button>
          
          <Button variant="ghost" size="lg" className="w-full flex items-center gap-2" onClick={handleShare}>
              <Share2 size={20} />
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
