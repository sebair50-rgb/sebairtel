
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
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
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
                placeholder="Write a comment..." 
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
  const { updatePost, currentUser, createNotification, deletePost, startEditPost } = useAppContext();
  const [isSaved, setIsSaved] = React.useState(post.isSaved);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
                message: `<strong>${currentUser.name}</strong> reacted to your post with ${emoji}`,
                fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
                link: `/post/${post.id}`
            })
        }
    }

    updatePost(post.id, { reactions: newReactions });
  };


  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({ description: !isSaved ? "Post saved!" : "Post unsaved!" });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post by ${post.user}!`);
    toast({ description: "Share link copied!" });
  }
  
  const handleNavigateToProfile = () => {
      if(post.userId) {
          router.push(`/profile/${post.userId}`);
      }
  }
  
  const formatCommentTime = (timestamp: any) => {
    if (!timestamp) return "";
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: enUS });
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ description: "Post link copied!" });
  };

  const handleReport = () => {
    toast({ title: "Your report has been received", description: "Thank you, we will review the post." });
  };
  
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
                 <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report Post</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.mediaSrc && (
          <div className="mt-4 rounded-lg overflow-hidden border">
             {post.mediaType === 'image' ? (
                <Image src={post.mediaSrc} alt="Post media" width={600} height={400} className="w-full h-auto object-cover" />
             ) : (
                <video src={post.mediaSrc} controls className="w-full h-auto bg-black" />
             )}
          </div>
        )}
      </CardContent>

      {getReactionSummary()}
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-muted-foreground border-t mt-2">
          <div className="flex items-center gap-1">
          <Popover>
              <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", myReaction && 'text-primary font-bold')}>
                      {myReaction ? <span className="text-lg">{myReaction.emoji}</span> : <Smile size={18} />}
                      <span className="text-sm">{myReaction ? 'Reacted' : 'React'}</span>
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto bg-transparent border-none shadow-none">
                  <ReactionPicker onSelect={handleReaction} />
              </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="text-sm">Comment</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleShare}>
              <Share2 size={18} />
              <span className="text-sm">Share</span>
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
                      <p className="text-sm text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
                  )}
              </div>
              <CommentInput postId={post.id} />
          </AccordionContent>
          {post.comments.length > 0 && (
              <AccordionTrigger className="p-4 pt-0 text-sm font-semibold text-muted-foreground hover:no-underline">
                  {`View all comments (${post.comments.length})`}
              </AccordionTrigger>
          )}
          </AccordionItem>
      </Accordion>
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
