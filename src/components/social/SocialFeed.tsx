
"use client";

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Video, Briefcase, Store, Newspaper, Users, ShoppingCart } from 'lucide-react';

import PostCard from './PostCard';
import CreatePostCard from './CreatePostCard';
import { useAppContext } from '@/store/AppContext';
import LiveFeed from './LiveFeed';
import MarketView from './MarketView';
import StoreView from './StoreView';
import NewsView from './NewsView';
import { Button } from '../ui/button';

const SocialFeed = () => {
    const { posts } = useAppContext();
    const [activeSocialTab, setActiveSocialTab] = useState('feed');

    const socialTabs = [
        { value: 'news', label: 'الأخبار', icon: Newspaper },
        { value: 'business', label: 'الأعمال', icon: Briefcase },
        { value: 'market', label: 'السوق', icon: Store },
        { value: 'live', label: 'البث المباشر', icon: Video },
        { value: 'feed', label: 'المنشورات العامة', icon: LayoutGrid },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-slate-100 dark:bg-black/90">
             <Tabs value={activeSocialTab} onValueChange={setActiveSocialTab} className="w-full h-full flex flex-col">
                <header className="p-4 md:px-6 md:py-4 border-b bg-background z-10 sticky top-0">
                     <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold">المجتمع</h1>
                        </div>
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                        </Button>
                    </div>
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1.5">
                       {socialTabs.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value} className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                                <tab.icon className="ml-1 sm:ml-2" />
                                {tab.label}
                            </TabsTrigger>
                       ))}
                    </TabsList>
                </header>
            
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6">
                        <TabsContent value="feed" className="mt-0">
                            <div className="max-w-2xl mx-auto space-y-6">
                                <CreatePostCard />
                                {posts.map(post => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="live" className="mt-0">
                            <LiveFeed />
                        </TabsContent>
                         <TabsContent value="news" className="mt-0">
                            <NewsView />
                        </TabsContent>
                        <TabsContent value="business" className="mt-0">
                            <MarketView />
                        </TabsContent>
                        <TabsContent value="market" className="mt-0">
                            <StoreView />
                        </TabsContent>
                    </div>
                </div>
             </Tabs>
        </div>
    );
};

export default SocialFeed;
