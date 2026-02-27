"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
import { useTranslation } from '@/store/LanguageContext';

const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { 
        users, currentUser, createChat, setSelectedChatId, setActiveTab, 
        unfriendUser, sendFriendRequest, acceptFriendRequest, isLoadingProfile
    } = useAppContext();
    
    const userId = params.id as string;
    const isOwnProfile = useMemo(() => userId === currentUser?.id || userId === 'me', [userId, currentUser?.id]);

    const profileUser = useMemo(() => {
        if (isOwnProfile) return currentUser;
        return users.find(u => u.id === userId) || null;
    }, [userId, isOwnProfile, currentUser, users]);

    const isLoading = isLoadingProfile || (profileUser === null && users.length === 0);

    const isFriend = useMemo(() => currentUser?.friends?.includes(profileUser?.id || ''), [currentUser, profileUser]);
    const requestSent = useMemo(() => currentUser?.friendRequestsSent?.includes(profileUser?.id || ''), [currentUser, profileUser]);
    const requestReceived = useMemo(() => currentUser?.friendRequestsReceived?.includes(profileUser?.id || ''), [currentUser, profileUser]);

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
            toast({
                title: t('usersView.requestSent'),
                description: t('usersView.requestSentDesc', { name: profileUser.name }),
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    }
    
    const handleAcceptFriend = async () => {
        if (!profileUser) return;
        await acceptFriendRequest(profileUser);
        toast({ title: t('usersView.friendAddedTitle'), description: t('usersView.friendAddedDesc', { name: profileUser.name }) });
    }

    const handleRemoveFriend = async () => {
        if(!profileUser) return;
        try {
            await unfriendUser(profileUser.id);
            toast({ title: t('profilePage.friendRemoved', { name: profileUser.name }) });
        } catch (error) {
            toast({ variant: 'destructive', title: t('profilePage.removeFriendFailed') });
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!profileUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-black">
                <h2 className="text-2xl font-bold">{t('profilePage.userNotFound')}</h2>
                <Button onClick={() => router.back()} className="mt-4">{t('profilePage.goBack')}</Button>
            </div>
        );
    }
    
    const profileFriends = users.filter(user => profileUser.friends?.includes(user.id));

    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-black">
            <ScrollArea className="h-full w-full">
                <div className="relative pb-16">
                    <div className="absolute top-4 left-4 z-10">
                        <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full" onClick={() => router.back()}><ArrowLeft /></Button>
                    </div>
                    <div className="h-48 md:h-64 w-full relative">
                        <Image src={placeholderImages.profile.cover.src} data-ai-hint={placeholderImages.profile.cover.hint} alt="Cover" layout="fill" objectFit="cover" className="bg-muted" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    
                    <div className="px-4 -mt-20">
                        <div className="relative w-40 h-40 mx-auto">
                            <Avatar className="w-full h-full border-4 border-background ring-4 ring-background shadow-2xl">
                                <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                                <AvatarFallback className="text-5xl">{profileUser.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className="text-center mt-4 px-4">
                        <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                        <p className="text-muted-foreground">{t('profilePage.friendsCount', { count: profileFriends.length })}</p>
                    </div>
                    
                    {!isOwnProfile && (
                        <div className="mt-4 px-4 flex items-center justify-center gap-2">
                             {isFriend ? (
                                <Button className="flex-1 max-w-xs" variant="secondary" onClick={handleMessage}>
                                    <MessageSquare size={20} className="mr-2" /> {t('profilePage.message')}
                                </Button>
                             ) : requestReceived ? (
                                <Button className="flex-1 max-w-xs" onClick={handleAcceptFriend}>
                                    <UserPlus size={20} className="mr-2" /> {t('profilePage.acceptRequest')}
                                </Button>
                            ) : requestSent ? (
                                <Button className="flex-1 max-w-xs" disabled>
                                    <Check size={20} className="mr-2" /> {t('profilePage.requestSent')}
                                </Button>
                             ) : (
                                <Button className="flex-1 max-w-xs" onClick={handleAddFriend}>
                                    <UserPlus size={20} className="mr-2" /> {t('profilePage.addFriend')}
                                </Button>
                             )}
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="secondary" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: t('profilePage.linkCopied') }); }}>
                                        <Share2 className="mr-2 h-4 w-4" /> <span>{t('profilePage.shareProfile')}</span>
                                    </DropdownMenuItem>
                                    {isFriend && (
                                        <DropdownMenuItem onClick={handleRemoveFriend} className="text-destructive focus:text-destructive">
                                            <UserMinus className="mr-2 h-4 w-4" /> <span>{t('profilePage.removeFriend')}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    
                    <div className="mt-8 px-4">
                        <Tabs defaultValue="about" className="w-full max-w-3xl mx-auto">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800">
                                <TabsTrigger value="about">{t('profilePage.about')}</TabsTrigger>
                                <TabsTrigger value="friends">{t('profilePage.friends')}</TabsTrigger>
                                <TabsTrigger value="photos">{t('profilePage.photos')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="about" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>{t('profilePage.details')}</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {profileUser.bio && <div className="text-center text-lg text-muted-foreground pt-2 pb-4 border-b"><p>{profileUser.bio}</p></div>}
                                        {profileUser.city && <div className="flex items-center gap-3 text-muted-foreground"><Home className="w-5 h-5 text-primary" /><span>{t('profilePage.livesIn')} <strong>{profileUser.city}</strong></span></div>}
                                        {profileUser.from && <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-5 h-5 text-primary" /><span>{t('profilePage.from')} <strong>{profileUser.from}</strong></span></div>}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="friends" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>{t('profilePage.friendsCount', { count: profileFriends.length })}</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {profileFriends.map(friend => (
                                                <Link href={`/profile/${friend.id}`} key={friend.id}>
                                                    <Card className="text-center p-3 hover:shadow-lg transition-shadow aspect-square flex flex-col justify-center items-center">
                                                        <Avatar className="w-16 h-16 mx-auto"><AvatarImage src={friend.avatar}/><AvatarFallback>{friend.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <p className="mt-2 font-semibold truncate text-sm">{friend.name}</p>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="photos" className="mt-4">
                               <Card>
                                    <CardHeader><CardTitle>{t('profilePage.photos')}</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {placeholderImages.profile.gallery.map((photo) => (
                                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                                     <Image src={photo.src} alt="Gallery" layout="fill" objectFit="cover" className="transition-transform group-hover:scale-110" />
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
        <Skeleton className="h-48 md:h-64 w-full" />
        <div className="px-4 -mt-20"><Skeleton className="w-40 h-40 mx-auto rounded-full" /></div>
        <div className="text-center mt-4 px-4 space-y-2"><Skeleton className="h-9 w-48 mx-auto" /><Skeleton className="h-5 w-32 mx-auto" /></div>
    </div>
);

export default UserProfilePage;
