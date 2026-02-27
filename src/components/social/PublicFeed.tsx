
"use client";

import React from 'react';
import CreatePost from './CreatePost';
import Stories from './Stories';
import PostCard from './PostCard';
import { useAppContext } from '@/store/AppContext';
import { useTranslation } from '@/store/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const PublicFeed = () => {
    const { posts } = useAppContext();
    const { t } = useTranslation();

    return (
        <div className="max-w-[680px] mx-auto w-full">
            <CreatePost />
            <Stories />
            
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-4">
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
                )}
            </div>
        </div>
    );
};

export default PublicFeed;
