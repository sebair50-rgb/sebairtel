
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, MessageSquare, MoreHorizontal, UserX, Share2, UserMinus, Home, MapPin, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/social/PostCard';


const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { users, currentUser, friends, createChat, setSelectedChatId, setActiveTab, unfriendUser, posts } = useAppContext();
    
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [userPosts, setUserPosts] = useState<typeof posts>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userId = params.id as string;
    const isOwnProfile = userId === currentUser?.id;

    useEffect(() => {
        if (users.length > 0 && currentUser) {
            const foundUser = users.find(u => u.id === userId) || (isOwnProfile ? currentUser : null);
            
            if (foundUser) {
                setProfileUser(foundUser);
                const postsForUser = posts.filter(p => p.userId === foundUser.id);
                setUserPosts(postsForUser);
            }
            setIsLoading(false);
        }
    }, [userId, users, currentUser, isOwnProfile, posts]);

    const handleMessage = async () => {
        if (!profileUser) return;
        const chat = await createChat(profileUser);
        if (chat) {
            setSelectedChatId(chat.id);
            // This assumes 'contact' is the key for the view with chats
            setActiveTab('contact'); 
            router.push('/');
        }
    };
    
    const handleAddFriend = () => {
        if(!profileUser) return;
        toast({
            title: `Friend request sent to ${profileUser.name}`,
            description: "(Feature in development)",
        });
    }

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copied",
            description: "You can now share their profile.",
        });
    };

    const handleBlockUser = () => {
        if(!profileUser) return;
        toast({
            variant: "destructive",
            title: `${profileUser.name} has been blocked`,
            description: "(Feature in development)",
        });
    };
    
    const handleRemoveFriend = async () => {
        if(!profileUser) return;
        try {
            await unfriendUser(profileUser.id);
            toast({
                title: `Removed ${profileUser.name} from friends`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to remove friend'
            });
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!profileUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-black">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-muted-foreground mt-2">The link may be incorrect or the user may have been deleted.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    const isFriend = friends.some(f => f.id === profileUser.id);

    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-black">
            <ScrollArea className="h-full w-full">
                <div className="relative pb-16">
                    <div className="absolute top-4 left-4 z-10">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="bg-background/50 backdrop-blur-sm rounded-full"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft />
                        </Button>
                    </div>
                    <div className="h-48 md:h-64 w-full relative">
                        <Image 
                            src="https://placehold.co/1000x400.png"
                            data-ai-hint="sunset clouds" 
                            alt="Cover Photo" 
                            layout="fill" 
                            objectFit="cover" 
                            className="bg-muted"
                        />
                    </div>
                    
                    <div className="px-4 -mt-20">
                        <div className="relative w-40 h-40 mx-auto">
                            <Avatar className="w-full h-full border-4 border-background ring-4 ring-background">
                                <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                                <AvatarFallback className="text-5xl">{profileUser.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className="text-center mt-4 px-4">
                        <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                        <p className="text-muted-foreground">{friends.length} الأصدقاء</p>
                    </div>
                    
                    {!isOwnProfile && (
                        <div className="mt-4 px-4 flex items-center justify-center gap-2">
                            <Button className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700" onClick={handleAddFriend}>
                                <UserPlus size={20} className="mr-2" />
                                إضافة صديق
                            </Button>
                            <Button variant="secondary" className="flex-1 max-w-xs" onClick={handleMessage}>
                                <MessageSquare size={20} className="mr-2" />
                                مراسلة
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleShareProfile}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        <span>Share Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isFriend && (
                                        <DropdownMenuItem onClick={handleRemoveFriend} className="text-destructive focus:text-destructive">
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            <span>Remove Friend</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleBlockUser} className="text-destructive focus:text-destructive">
                                        <UserX className="mr-2 h-4 w-4" />
                                        <span>Block User</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    
                    <div className="mt-4 border-t px-4">
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-transparent mt-2">
                                <TabsTrigger value="posts">المنشورات</TabsTrigger>
                                <TabsTrigger value="photos">الصور</TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
                                    <div className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>التفاصيل</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {profileUser.city && (
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <Home className="w-5 h-5" />
                                                        <span>Lives in {profileUser.city}</span>
                                                    </div>
                                                )}
                                                {profileUser.from && (
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <MapPin className="w-5 h-5" />
                                                        <span>From {profileUser.from}</span>
                                                    </div>
                                                )}
                                                {(!profileUser.city && !profileUser.from) && (
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <Info className="w-5 h-5" />
                                                        <span>No location details available.</span>
                                                    </div>
                                                )}
                                                {profileUser.bio && (
                                                    <div className="flex items-start gap-3 text-muted-foreground pt-2 border-t">
                                                        <p>{profileUser.bio}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">منشورات {profileUser.name}</h3>
                                        {userPosts.length > 0 ? (
                                            userPosts.map(post => <PostCard key={post.id} post={post} />)
                                        ) : (
                                            <Card className="p-8 text-center text-muted-foreground">
                                                <p>No posts yet.</p>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="photos" className="mt-4">
                                <Card className="p-8 text-center text-muted-foreground">
                                    <p>Photos will be shown here.</p>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};


const ProfileSkeleton = () => (
    <div className="w-full h-full bg-slate-100 dark:bg-black">
        <div className="relative">
            <Skeleton className="h-48 md:h-64 w-full bg-muted" />
        </div>
        <div className="px-4 -mt-20">
            <div className="relative w-40 h-40 mx-auto">
                <Skeleton className="w-full h-full rounded-full" />
            </div>
        </div>
        <div className="text-center mt-4 px-4 space-y-2">
            <Skeleton className="h-9 w-48 mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
        </div>
        <div className="mt-4 px-4 flex items-center justify-center gap-2">
            <Skeleton className="h-10 flex-1 max-w-xs" />
            <Skeleton className="h-10 flex-1 max-w-xs" />
            <Skeleton className="h-10 w-10" />
        </div>
        <div className="mt-4 border-t px-4">
            <div className="flex w-full justify-around mt-2">
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-8 w-24" />
            </div>
        </div>
    </div>
);


export default UserProfilePage;
