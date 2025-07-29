
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import PostCard from './PostCard';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, ShoppingCart, Users, Briefcase, Newspaper } from 'lucide-react';
import CreatePostCard from './CreatePostCard';

const SocialFeed = () => {
    const { posts } = useAppContext();

    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 md:p-6 pb-0">
                <h1 className="text-3xl font-bold">المجتمع</h1>
            </div>
            <ScrollArea className="h-full">
                <div className="max-w-2xl mx-auto p-4 pt-2 md:p-6 md:pt-2 space-y-6">
                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
                            <TabsTrigger value="news">الأخبار</TabsTrigger>
                            <TabsTrigger value="services">خدماتي</TabsTrigger>
                            <TabsTrigger value="market">السوق</TabsTrigger>
                            <TabsTrigger value="friends">الأصدقاء</TabsTrigger>
                            <TabsTrigger value="live">بث مباشر</TabsTrigger>
                            <TabsTrigger value="posts">العامة</TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts" className="mt-6 space-y-6">
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
                        <TabsContent value="live">
                            <ComingSoonContent title="البث المباشر" icon={Video} />
                        </TabsContent>
                        <TabsContent value="friends">
                            <ComingSoonContent title="الأصدقاء" icon={Users} />
                        </TabsContent>
                        <TabsContent value="market">
                            <ComingSoonContent title="السوق" icon={ShoppingCart} />
                        </TabsContent>
                        <TabsContent value="services">
                            <ComingSoonContent title="خدماتي" icon={Briefcase} />
                        </TabsContent>
                        <TabsContent value="news">
                            <ComingSoonContent title="الأخبار" icon={Newspaper} />
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
};

export default SocialFeed;
