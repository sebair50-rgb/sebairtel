"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import PostCard from './PostCard';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Video, ShoppingCart, Users, Briefcase, Newspaper } from 'lucide-react';

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

    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
        </div>
    );

    return (
        <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold">المجتمع</h1>
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 gap-1">
                        <TabsTrigger value="news">الأخبار</TabsTrigger>
                        <TabsTrigger value="services">خدماتي</TabsTrigger>
                        <TabsTrigger value="market">السوق</TabsTrigger>
                        <TabsTrigger value="friends">الأصدقاء</TabsTrigger>
                        <TabsTrigger value="live">بث مباشر</TabsTrigger>
                        <TabsTrigger value="posts">المنشورات العامة</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mt-6">
                         <div className="space-y-6">
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
    );
};

export default SocialFeed;
