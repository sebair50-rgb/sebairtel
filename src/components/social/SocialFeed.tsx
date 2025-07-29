"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import PostCard from './PostCard';
import { ScrollArea } from '../ui/scroll-area';

const SocialFeed = () => {
    const { posts, setPosts, handleShareToChat, chats } = useAppContext();

    const handleLike = (postId: number) => {
        setPosts(prevPosts =>
            prevPosts.map(p =>
                p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
            )
        );
    };

    const handleSave = (postId: number) => {
        setPosts(prevPosts =>
            prevPosts.map(p => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
        );
    };

    return (
        <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                 <h1 className="text-2xl font-bold">آخر الأخبار</h1>
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                        onShare={handleShareToChat}
                        chats={chats}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};

export default SocialFeed;
