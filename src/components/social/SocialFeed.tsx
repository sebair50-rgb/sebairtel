"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Briefcase, Store, Globe, Notebook, Home } from 'lucide-react';

import PostCard from './PostCard';
import CreatePostCard from './CreatePostCard';
import { useAppContext } from '@/store/AppContext';
import LiveFeed from './LiveFeed';
import MarketView from './MarketView';
import StoreView from './StoreView';
import NewsView from './NewsView';
import AppHeader from '../layout/AppHeader';

const SocialFeed = () => {
    const { posts } = useAppContext();
    const [activeSocialTab, setActiveSocialTab] = useState('posts');

    const socialTabs = [
        { value: 'news', label: 'News', icon: Globe },
        { value: 'business', label: 'Business', icon: Briefcase },
        { value: 'market', label: 'Market', icon: Store },
        { value: 'live', label: 'Live', icon: Video },
        { value: 'posts', label: 'Posts', icon: Notebook },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black">
             <Tabs value={activeSocialTab} onValueChange={setActiveSocialTab} className="w-full h-full flex flex-col">
                <div className="bg-background border-b sticky top-0 z-10">
                    <AppHeader title="Community" icon={Home} />
                    <div className="px-4 md:px-6 pb-2">
                        <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-amber-100 dark:bg-stone-900">
                        {socialTabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                                    <tab.icon className="mr-1 sm:mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                        ))}
                        </TabsList>
                    </div>
                </div>
            
                <TabsContent value="posts" className="flex-1 overflow-y-auto mt-0">
                    <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
                        <CreatePostCard />
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="live" className="flex-1 overflow-y-auto mt-0 p-4 md:p-6">
                    <LiveFeed />
                </TabsContent>
                <TabsContent value="news" className="flex-1 overflow-y-auto mt-0 p-4 md:p-6">
                    <NewsView />
                </TabsContent>
                <TabsContent value="business" className="flex-1 overflow-y-auto mt-0 p-4 md:p-6">
                    <MarketView />
                </TabsContent>
                <TabsContent value="market" className="flex-1 overflow-y-auto mt-0 p-4 md:p-6">
                    <StoreView />
                </TabsContent>
             </Tabs>
        </div>
    );
};

export default SocialFeed;
