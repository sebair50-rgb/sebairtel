
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, MessageSquare, MoreHorizontal, UserX, Share2, UserMinus, Home, MapPin, Info, Check } from 'lucide-react';
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
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';


const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { users, currentUser, friends, createChat, setSelectedChatId, setActiveTab, unfriendUser, sendFriendRequest } = useAppContext();
    
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const userId = params.id as string;
    const isOwnProfile = userId === currentUser?.id;

    useEffect(() => {
        if (users.length > 0 && currentUser) {
            const foundUser = users.find(u => u.id === userId) || (isOwnProfile ? currentUser : null);
            
            if (foundUser) {
                setProfileUser(foundUser);
                setIsFriend(friends.some(f => f.id === foundUser.id));
                setRequestSent(foundUser.requestSent || false);
            }
            setIsLoading(false);
        }
    }, [userId, users, currentUser, isOwnProfile, friends]);

    const handleMessage = async () => {
        if (!profileUser) return;
        const chat = await createChat(profileUser);
        if (chat) {
            setSelectedChatId(chat.id);
            setActiveTab('contact'); 
            router.push('/');
        }
    };
    
    const handleAddFriend = async () => {
        if(!profileUser) return;
        try {
            await sendFriendRequest(profileUser);
            setRequestSent(true);
            toast({
                title: `Friend request sent to ${profileUser.name}`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || "Could not send friend request."
            })
        }
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
            setIsFriend(false);
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
    
    const profileFriends = users.filter(user => profileUser.friends?.includes(user.id));

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
                            src={placeholderImages.profile.cover.src}
                            data-ai-hint={placeholderImages.profile.cover.hint} 
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
                        <p className="text-muted-foreground">{profileFriends.length} Friends</p>
                    </div>
                    
                    {!isOwnProfile && (
                        <div className="mt-4 px-4 flex items-center justify-center gap-2">
                             {isFriend ? (
                                <Button className="flex-1 max-w-xs" variant="secondary" onClick={handleMessage}>
                                    <MessageSquare size={20} className="mr-2" />
                                    Message
                                </Button>
                             ) : (
                                <Button className="flex-1 max-w-xs" onClick={handleAddFriend} disabled={requestSent}>
                                    {requestSent ? <Check size={20} className="mr-2" /> : <UserPlus size={20} className="mr-2" />}
                                    {requestSent ? 'Request Sent' : 'Add Friend'}
                                </Button>
                             )}
                            
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
                    
                    <div className="mt-8 px-4">
                        <Tabs defaultValue="about" className="w-full max-w-3xl mx-auto">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800">
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="friends">Friends</TabsTrigger>
                                <TabsTrigger value="photos">Photos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="about" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {profileUser.bio && (
                                            <div className="text-center text-lg text-muted-foreground pt-2 pb-4">
                                                <p>{profileUser.bio}</p>
                                            </div>
                                        )}
                                        {profileUser.city && (
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Home className="w-5 h-5" />
                                                <span>Lives in <strong>{profileUser.city}</strong></span>
                                            </div>
                                        )}
                                        {profileUser.from && (
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <MapPin className="w-5 h-5" />
                                                <span>From <strong>{profileUser.from}</strong></span>
                                            </div>
                                        )}
                                        {(!profileUser.city && !profileUser.from && !profileUser.bio) && (
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Info className="w-5 h-5" />
                                                <span>No details available.</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="friends" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Friends ({profileFriends.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {profileFriends.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {profileFriends.map(friend => (
                                                    <Link href={`/profile/${friend.id}`} key={friend.id}>
                                                        <Card className="text-center p-3 hover:shadow-lg transition-shadow aspect-square flex flex-col justify-center items-center">
                                                            <Avatar className="w-16 h-16 mx-auto">
                                                                <AvatarImage src={friend.avatar} alt={friend.name}/>
                                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <p className="mt-2 font-semibold truncate text-sm">{friend.name}</p>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">This user has no friends to show.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="photos" className="mt-4">
                               <Card>
                                    <CardHeader>
                                        <CardTitle>Photos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {placeholderImages.profile.gallery.map((photo) => (
                                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                                     <Image 
                                                        src={photo.src} 
                                                        alt={photo.hint} 
                                                        layout="fill" 
                                                        objectFit="cover" 
                                                        className="transition-transform group-hover:scale-110"
                                                        data-ai-hint={photo.hint}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
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
            <Skeleton className="h-10 w-10" />
        </div>
        <div className="mt-8 px-4 max-w-3xl mx-auto">
             <div className="flex w-full justify-around mt-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-8 w-24" />
            </div>
        </div>
    </div>
);


export default UserProfilePage;
