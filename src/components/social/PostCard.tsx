
"use client";

import React, { useState } from 'react';
import type { Post, Reaction } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { 
    MoreHorizontal, X, ThumbsUp, MessageSquare, Share2, Globe, 
    Heart, Smile, Laugh, Frown, MessageCircle, Send
} from 'lucide-react';
import { useTranslation } from '@/store/LanguageContext';
import { useAppContext } from '@/store/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { enUS, arSA } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { t, language } = useTranslation();
    const { currentUser, deletePost, updatePost, addComment } = useAppContext();
    const { toast } = useToast();
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const isOwnPost = currentUser?.id === post.userId;
    const timeAgo = formatDistanceToNow(post.timestamp?.toDate() || new Date(), { 
        addSuffix: true, 
        locale: language === 'ar' ? arSA : enUS 
    });

    const handleLike = async () => {
        if (!currentUser) return;
        
        const existingReaction = post.reactions.find(r => r.userId === currentUser.id);
        let newReactions = [...post.reactions];

        if (existingReaction) {
            newReactions = newReactions.filter(r => r.userId !== currentUser.id);
        } else {
            newReactions.push({ userId: currentUser.id, emoji: '👍' });
        }

        await updatePost(post.id, { reactions: newReactions });
    };

    const handleDelete = async () => {
        try {
            await deletePost(post.id);
            toast({ title: t('postCard.postDeleted') });
        } catch (error) {
            toast({ variant: 'destructive', title: t('postCard.deleteFailed') });
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        await addComment(post.id, newComment);
        setNewComment('');
        setShowComments(true);
    };

    const hasReacted = post.reactions.some(r => r.userId === currentUser?.id);

    return (
        <Card className="w-full shadow-sm border-none md:border md:rounded-xl overflow-hidden mb-4">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={post.avatar} alt={post.user} />
                        <AvatarFallback>{post.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-1">
                            <h3 className="font-bold text-[15px] hover:underline cursor-pointer">{post.user}</h3>
                            <div className="bg-blue-500 rounded-full p-0.5">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{timeAgo}</span>
                            <span>&middot;</span>
                            <Globe size={12} />
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast({ description: t('postCard.postLinkCopied') });
                            }}>
                                {t('postCard.copyLink')}
                            </DropdownMenuItem>
                            {isOwnPost && (
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                    {t('postCard.deletePost')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <X size={20} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                {post.mediaSrc && (
                    <div className="relative w-full aspect-auto min-h-[200px] -mx-4 md:mx-0 overflow-hidden bg-slate-100 border-y md:border-none">
                        <img 
                            src={post.mediaSrc} 
                            alt="Post media" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col p-0 px-4">
                <div className="flex items-center justify-between w-full py-2 border-b">
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                            <div className="bg-blue-500 rounded-full p-1 border-2 border-white"><ThumbsUp size={10} fill="white" className="text-white" /></div>
                            <div className="bg-red-500 rounded-full p-1 border-2 border-white"><Heart size={10} fill="white" className="text-white" /></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{post.reactions.length}</span>
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>{post.comments?.length || 0} {t('postCard.comment')}</span>
                        <span>0 {t('postCard.share')}</span>
                    </div>
                </div>

                <div className="flex w-full py-1">
                    <Button 
                        variant="ghost" 
                        className={cn("flex-1 gap-2 text-muted-foreground h-10", hasReacted && "text-blue-600")}
                        onClick={handleLike}
                    >
                        <ThumbsUp size={18} fill={hasReacted ? "currentColor" : "none"} />
                        <span className="font-semibold">{t('postCard.react')}</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="flex-1 gap-2 text-muted-foreground h-10"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle size={18} />
                        <span className="font-semibold">{t('postCard.comment')}</span>
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground h-10">
                        <Share2 size={18} />
                        <span className="font-semibold">{t('postCard.share')}</span>
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full py-4 space-y-4 border-t">
                        {post.comments?.map((comment, i) => (
                            <div key={i} className="flex gap-2">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={comment.avatar} />
                                    <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
                                    <p className="text-xs font-bold">{comment.user}</p>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                        <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser?.avatar} />
                                <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="relative flex-1">
                                <Input 
                                    placeholder={t('postCard.comment')} 
                                    className="rounded-full bg-slate-100 dark:bg-slate-800 border-none h-9 pr-10"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-blue-600">
                                    <Send size={16} />
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default PostCard;
