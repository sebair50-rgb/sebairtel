
"use client";

import React from 'react';
import CreatePost from './CreatePost';
import Stories from './Stories';
import PostCard from './PostCard';
import { useAppContext } from '@/store/AppContext';
import { useTranslation } from '@/store/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

const PublicFeed = () => {
    const { posts } = useAppContext();
    const { t } = useTranslation();

    return (
        <div className="max-w-[680px] mx-auto w-full">
            <CreatePost />
            <Stories />
            
            <div className="space-y-4 pb-20">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    posts === undefined ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-4 border">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-48 w-full rounded-lg" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed text-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <MessageCircle className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">No posts yet</h3>
                                <p className="text-muted-foreground">Be the first to share something with the community!</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default PublicFeed;
