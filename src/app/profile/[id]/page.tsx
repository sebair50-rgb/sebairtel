
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, MessageSquare, Users, MoreVertical, UserX, Share2, UserMinus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { users, currentUser, friends, createChat, setSelectedChatId, setActiveTab, unfriendUser } = useAppContext();
    
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [mutualFriends, setMutualFriends] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userId = params.id as string;
    const isOwnProfile = userId === currentUser?.id;

    useEffect(() => {
        if (users.length > 0 && currentUser) {
            const foundUser = users.find(u => u.id === userId) || (isOwnProfile ? currentUser : null);
            
            if (foundUser) {
                setProfileUser(foundUser);
                
                // Calculate mutual friends
                if (!isOwnProfile) {
                    const profileUserFriendIds = new Set(
                        users.filter(u => friends.some(f => f.id === u.id)).map(f => f.id)
                    );
                    
                    const currentUserFriendIds = new Set(friends.map(f => f.id));
                    
                    const mutual = users.filter(user => 
                        user.id !== currentUser.id &&
                        user.id !== foundUser.id &&
                        currentUserFriendIds.has(user.id) &&
                        profileUserFriendIds.has(user.id)
                    );
                    setMutualFriends(mutual);
                }

            }
            setIsLoading(false);
        }
    }, [userId, users, currentUser, friends, isOwnProfile]);

    const handleMessage = async () => {
        if (!profileUser) return;
        const chat = await createChat(profileUser);
        if (chat) {
            setSelectedChatId(chat.id);
            setActiveTab('contact');
            router.push('/');
        }
    };
    
    const handleAddFriend = () => {
        if(!profileUser) return;
        toast({
            title: `تم إرسال طلب صداقة إلى ${profileUser.name}`,
            description: "(ميزة قيد التطوير)",
        });
    }

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "تم نسخ الرابط",
            description: "يمكنك الآن مشاركة ملفه الشخصي.",
        });
    };

    const handleBlockUser = () => {
        if(!profileUser) return;
        toast({
            variant: "destructive",
            title: `تم حظر ${profileUser.name}`,
            description: "(ميزة قيد التطوير)",
        });
    };
    
    const handleRemoveFriend = async () => {
        if(!profileUser) return;
        try {
            await unfriendUser(profileUser.id);
            toast({
                title: `تمت إزالة ${profileUser.name} من الأصدقاء`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'فشل في إزالة الصديق'
            });
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!profileUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold">لم يتم العثور على المستخدم</h2>
                <p className="text-muted-foreground mt-2">قد يكون الرابط غير صحيح أو تم حذف المستخدم.</p>
                <Button onClick={() => router.back()} className="mt-4">العودة</Button>
            </div>
        );
    }
    
    const isFriend = friends.some(f => f.id === profileUser.id);
    
    const getStatus = () => {
        if (isOwnProfile) return "هذا هو ملفك الشخصي";
        if (profileUser.isOnline) return "متصل الآن";
        if (profileUser.lastSeen) {
            return `آخر ظهور ${formatDistanceToNow(profileUser.lastSeen.toDate(), { addSuffix: true, locale: ar })}`;
        }
        return `البريد الإلكتروني: ${profileUser.email}`;
    }

    return (
        <ScrollArea className="h-full w-full bg-slate-50">
            <div className="relative container max-w-4xl mx-auto p-4 md:p-6">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-6 right-6 z-10 bg-background/50 backdrop-blur-sm rounded-full"
                    onClick={() => router.back()}
                >
                    <ArrowRight />
                </Button>

                <Card className="overflow-hidden shadow-lg">
                    <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-accent/20" />
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="flex items-end -mt-16 gap-4">
                            <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-primary/50">
                                <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                                <AvatarFallback className="text-4xl">{profileUser.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-4">
                                <h1 className="text-2xl md:text-3xl font-bold">{profileUser.name}</h1>
                                <p className="text-muted-foreground">{getStatus()}</p>
                            </div>
                        </div>

                        <div className="mt-4 text-muted-foreground">
                            <p>{profileUser.bio || "لا توجد نبذة شخصية."}</p>
                        </div>
                        
                        {!isOwnProfile && (
                            <div className="mt-6 flex items-center gap-2">
                                <Button className="flex-1" onClick={handleMessage}>
                                    <MessageSquare size={16} className="ml-2" />
                                    مراسلة
                                </Button>
                                {!isFriend && (
                                     <Button variant="outline" className="flex-1" onClick={handleAddFriend}>
                                        <UserPlus size={16} className="ml-2" />
                                        إضافة صديق
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleShareProfile}>
                                            <Share2 className="ml-2 h-4 w-4" />
                                            <span>مشاركة الملف الشخصي</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {isFriend && (
                                            <DropdownMenuItem onClick={handleRemoveFriend} className="text-destructive focus:text-destructive">
                                                <UserMinus className="ml-2 h-4 w-4" />
                                                <span>إزالة الصديق</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={handleBlockUser} className="text-destructive focus:text-destructive">
                                            <UserX className="ml-2 h-4 w-4" />
                                            <span>حظر المستخدم</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {mutualFriends.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users />
                                الأصدقاء المشتركون ({mutualFriends.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mutualFriends.map(friend => (
                                <div key={friend.id} className="flex flex-col items-center text-center gap-2" onClick={() => router.push(`/profile/${friend.id}`)}>
                                    <Avatar className="w-16 h-16 cursor-pointer">
                                        <AvatarImage src={friend.avatar} alt={friend.name} />
                                        <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold text-sm truncate w-full cursor-pointer">{friend.name}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </ScrollArea>
    );
};


const ProfileSkeleton = () => (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <Card className="overflow-hidden">
            <Skeleton className="h-32 md:h-48 w-full" />
            <CardContent className="p-4 md:p-6 pt-0">
                <div className="flex items-end -mt-16 gap-4">
                    <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
                    <div className="flex-1 pb-4 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-6 flex items-center gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
        <Card className="mt-6">
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-2">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);


export default UserProfilePage;

    