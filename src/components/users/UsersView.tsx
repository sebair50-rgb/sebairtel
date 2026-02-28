
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MessageSquare, Check, UserCheck, CheckCheck, MapPin, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useTranslation } from '@/store/LanguageContext';
import { Card } from '../ui/card';

interface UsersViewProps {
  setActiveTab: (tab: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ setActiveTab }) => {
    const { 
        friends, suggestedUsers, friendRequests, currentUser,
        createChat, setSelectedChatId, sendFriendRequest,
        acceptFriendRequest, declineFriendRequest
    } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { toast } = useToast();
    const [activeList, setActiveList] = useState<'friends' | 'suggestions' | 'requests'>('friends');
    const router = useRouter();
    const { t } = useTranslation();

    const handleAddFriend = async (user: UserType) => {
        try {
            await sendFriendRequest(user);
            toast({
                title: t('usersView.requestSent'),
                description: t('usersView.requestSentDesc', { name: user.name }),
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: t('usersView.requestError'),
                description: error.message || t('usersView.requestErrorDesc'),
            });
        }
    };
    
    const handleMessageFriend = async (user: UserType) => {
        const chat = await createChat(user);
        if (chat) {
            setSelectedChatId(chat.id);
            setActiveTab('contact');
        }
    };

    const handleAccept = async (user: UserType) => {
        await acceptFriendRequest(user);
        toast({
            title: t('usersView.friendAddedTitle'),
            description: t('usersView.friendAddedDesc', { name: user.name })
        });
    };
    
    const handleDecline = async (user: UserType) => {
        await declineFriendRequest(user);
        toast({
            title: t('usersView.requestDeclinedTitle'),
            description: t('usersView.requestDeclinedDesc', { name: user.name })
        });
    }

    const filteredSuggestedUsers = suggestedUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredFriends = friends.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredFriendRequests = friendRequests.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let listToShow: UserType[] = [];
    let title: string = '';
    let actionType: 'add' | 'message' | 'request' = 'add';

    switch (activeList) {
        case 'friends':
            listToShow = filteredFriends;
            title = t('usersView.yourFriendsCount', { count: filteredFriends.length });
            actionType = 'message';
            break;
        case 'suggestions':
            listToShow = filteredSuggestedUsers;
            title = "Potential Trustees";
            actionType = 'add';
            break;
        case 'requests':
            listToShow = filteredFriendRequests;
            title = t('usersView.requestsCount', { count: filteredFriendRequests.length });
            actionType = 'request';
            break;
    }


    const UserCard = ({ user, action }: { user: UserType, action: 'add' | 'message' | 'request' }) => {
        const isRequestSent = currentUser?.friendRequestsSent?.includes(user.id);

        return (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
            >
                <Card className="p-4 flex items-center justify-between gap-4 border-none shadow-none hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors rounded-xl overflow-hidden">
                    <div 
                        className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                        onClick={() => router.push(`/profile/${user.id}`)}
                    >
                        <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                    {user.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {user.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                            )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-lg truncate leading-tight">{user.name}</p>
                                {action === 'message' && <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {user.city ? (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span>{user.city}</span>
                                    </div>
                                ) : (
                                    user.bio && <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center">
                        {action === 'add' ? (
                            <Button 
                                className={cn(
                                    "rounded-full px-5 font-semibold transition-all h-9",
                                    isRequestSent 
                                        ? "bg-muted text-muted-foreground border hover:bg-muted" 
                                        : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                )}
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); if(!isRequestSent) handleAddFriend(user); }}
                                disabled={isRequestSent}
                            >
                                {isRequestSent ? (
                                    <><Check size={16} className="mr-1.5" /> {t('profilePage.requestSent')}</>
                                ) : (
                                    <><UserPlus size={16} className="mr-1.5" /> {t('usersView.add')}</>
                                )}
                            </Button>
                        ) : action === 'message' ? (
                            <Button 
                                variant="outline"
                                className="rounded-full h-9 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleMessageFriend(user); }}
                            >
                                <MessageSquare size={16} className="mr-1.5" />
                                {t('usersView.message')}
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="rounded-full h-9 text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {e.stopPropagation(); handleDecline(user)}}
                                >
                                    {t('liveStreamPage.decline')}
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="rounded-full h-9 bg-primary shadow-sm"
                                    onClick={(e) => {e.stopPropagation(); handleAccept(user)}}
                                >
                                    {t('liveStreamPage.accept')}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        )
    };

    return (
        <div className="w-full flex flex-col h-full bg-white dark:bg-black">
            <div className="p-4 md:p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{t('usersView.friends')}</h1>
                        <p className="text-sm text-muted-foreground">Manage your connections and discover trustees.</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("rounded-full h-10 w-10", showSearch && "bg-primary/10 text-primary")} 
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
                
                <AnimatePresence>
                {showSearch && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('usersView.searchPlaceholder')}
                                className="w-full rounded-2xl bg-slate-100 dark:bg-slate-900 h-11 pl-11 text-base border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                     <Button 
                        variant={activeList === 'friends' ? 'default' : 'secondary'} 
                        className="rounded-full h-9 px-5 shrink-0"
                        onClick={() => setActiveList('friends')}
                    >
                        {t('usersView.yourFriends')}
                    </Button>
                    <Button 
                        variant={activeList === 'suggestions' ? 'default' : 'secondary'} 
                        className="rounded-full h-9 px-5 shrink-0"
                        onClick={() => setActiveList('suggestions')}
                    >
                        Suggestions
                    </Button>
                     <Button 
                        variant={activeList === 'requests' ? 'default' : 'secondary'} 
                        className="rounded-full h-9 px-5 shrink-0 relative"
                        onClick={() => setActiveList('requests')}
                    >
                        {t('usersView.requests')}
                        {friendRequests.length > 0 && (
                            <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                                {friendRequests.length}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full font-medium">
                            {listToShow.length} found
                        </span>
                    </div>
                    
                    {listToShow.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                             <AnimatePresence mode="popLayout">
                                {listToShow.map(user => (
                                    <UserCard 
                                        key={user.id} 
                                        user={user} 
                                        action={actionType}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-full mb-4">
                                <Search className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <p className="font-bold text-lg">
                                {searchTerm 
                                    ? t('usersView.noResults', { searchTerm })
                                    : (activeList === 'friends' 
                                        ? t('usersView.noFriends')
                                        : activeList === 'requests'
                                        ? t('usersView.noRequests')
                                        : "No potential trustees found")}
                            </p>
                            <p className="text-sm text-muted-foreground max-w-[250px] mt-1 mx-auto">
                                {activeList === 'friends' && !searchTerm
                                    ? t('usersView.noFriendsDesc')
                                    : !searchTerm && "We've looked everywhere, but there are no new suggestions right now."}
                            </p>
                            {!searchTerm && activeList === 'suggestions' && (
                                <Button 
                                    variant="outline" 
                                    className="mt-6 rounded-full" 
                                    onClick={() => setActiveList('friends')}
                                >
                                    View your existing friends
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
