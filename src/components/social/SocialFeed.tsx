
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import PostCard from './PostCard';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, ShoppingCart, Users, Briefcase, Newspaper, Building2 } from 'lucide-react';
import CreatePostCard from './CreatePostCard';
import LiveFeed from './LiveFeed';
import UsersView from '../users/UsersView';
import MarketView from './MarketView';
import StoreView from './StoreView';
import NewsView from './NewsView';

const SocialFeed = () => {
    const { posts, setActiveTab } = useAppContext();

    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
            <header className="bg-white p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <Users className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold">المجتمع</h1>
                </div>
            </header>
            <ScrollArea className="h-full">
                <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-200">
                            <TabsTrigger value="news">الأخبار</TabsTrigger>
                            <TabsTrigger value="market">السوق</TabsTrigger>
                            <TabsTrigger value="business">الأعمال التجارية</TabsTrigger>
                            <TabsTrigger value="friends">الأصدقاء</TabsTrigger>
                            <TabsTrigger value="live">بث مباشر</TabsTrigger>
                            <TabsTrigger value="posts">العامة</TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts" className="mt-6 space-y-6 max-w-2xl mx-auto">
                            <CreatePostCard />
                            <div className="space-y-6">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                         <TabsContent value="live" className="mt-6">
                            <LiveFeed />
                        </TabsContent>
                        <TabsContent value="friends" className="mt-6">
                            <div className="max-w-2xl mx-auto">
                                <UsersView setActiveTab={setActiveTab} />
                            </div>
                        </TabsContent>
                        <TabsContent value="business" className="mt-6">
                            <MarketView />
                        </TabsContent>
                        <TabsContent value="market" className="mt-6">
                            <StoreView />
                        </TabsContent>
                        <TabsContent value="news" className="mt-6">
                             <NewsView />
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
};

export default SocialFeed;
