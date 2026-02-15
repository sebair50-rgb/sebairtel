
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MessageSquare, Check, UserCheck, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface UsersViewProps {
  setActiveTab: (tab: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ setActiveTab }) => {
    const { 
        friends, suggestedUsers, friendRequests, 
        createChat, setSelectedChatId, sendFriendRequest,
        acceptFriendRequest, declineFriendRequest
    } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { toast } = useToast();
    const [activeList, setActiveList] = useState<'friends' | 'suggestions' | 'requests'>('friends');
    const router = useRouter();

    const handleAddFriend = async (user: UserType) => {
        try {
            await sendFriendRequest(user);
            toast({
                title: "Request Sent!",
                description: `A friend request has been sent to ${user.name}.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "An error occurred",
                description: "We couldn't send the friend request. Please try again.",
            });
        }
    };
    
    const handleMessageFriend = async (user: UserType) => {
        const chat = await createChat(user);
        if (chat) {
            setSelectedChatId(chat.id);
        }
    };

    const handleAccept = async (user: UserType) => {
        await acceptFriendRequest(user);
        toast({
            title: 'Friend Added',
            description: `You and ${user.name} are now friends.`
        });
    };
    
    const handleDecline = async (user: UserType) => {
        await declineFriendRequest(user);
        toast({
            title: 'Request Declined',
            description: `You have declined the friend request from ${user.name}.`
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
            title = `Your Friends (${filteredFriends.length})`;
            actionType = 'message';
            break;
        case 'suggestions':
            listToShow = filteredSuggestedUsers;
            title = `People You May Know (${filteredSuggestedUsers.length})`;
            actionType = 'add';
            break;
        case 'requests':
            listToShow = filteredFriendRequests;
            title = `Friend Requests (${filteredFriendRequests.length})`;
            actionType = 'request';
            break;
    }


    const UserCard = ({ user, action }: { user: UserType, action: 'add' | 'message' | 'request' }) => (
         <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between gap-4 py-3"
        >
            <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => router.push(`/profile/${user.id}`)}
            >
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                    <p className="font-bold text-lg truncate">{user.name}</p>
                </div>
            </div>
            {action === 'add' ? (
                 <Button 
                    className="bg-primary hover:bg-primary/90" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleAddFriend(user); }}
                    disabled={user.friendRequestsSent?.includes(user.id)}
                >
                    <UserPlus size={16} className="mr-1" />
                    Add
                </Button>
            ) : action === 'message' ? (
                <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={(e) => { e.stopPropagation(); handleMessageFriend(user); }}>
                    <MessageSquare size={16} className="mr-1" />
                    Message
                </Button>
            ) : (
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); handleDecline(user)}}>Decline</Button>
                    <Button size="sm" onClick={(e) => {e.stopPropagation(); handleAccept(user)}}>Accept</Button>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="w-full flex flex-col h-full bg-white">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Friends</h1>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSearch(!showSearch)}>
                        <Search />
                    </Button>
                </div>
                <AnimatePresence>
                {showSearch && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for people..."
                                className="w-full rounded-full bg-slate-100 h-12 pl-12 text-base border-slate-200 focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
                <div className="flex gap-2 mt-4">
                     <Button 
                        variant={activeList === 'friends' ? 'secondary' : 'ghost'} 
                        className="rounded-full"
                        onClick={() => setActiveList('friends')}
                    >
                        Your Friends
                    </Button>
                    <Button 
                        variant={activeList === 'suggestions' ? 'secondary' : 'ghost'} 
                        className="rounded-full"
                        onClick={() => setActiveList('suggestions')}
                    >
                        Suggestions
                    </Button>
                     <Button 
                        variant={activeList === 'requests' ? 'secondary' : 'ghost'} 
                        className="rounded-full relative"
                        onClick={() => setActiveList('requests')}
                    >
                        Requests
                        {friendRequests.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{friendRequests.length}</Badge>}
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-muted-foreground mb-2">{title}</h2>
                    {listToShow.length > 0 ? (
                        <div className="divide-y">
                             <AnimatePresence>
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
                        <div className="text-center text-muted-foreground pt-16">
                            <p className="font-semibold">
                                {searchTerm 
                                    ? `No results found for "${searchTerm}"`
                                    : (activeList === 'friends' 
                                        ? 'You haven\'t added any friends yet.'
                                        : activeList === 'requests'
                                        ? 'You have no pending friend requests.'
                                        : 'No new suggestions at this time.')
                                }
                            </p>
                            <p className="text-sm">
                                {activeList === 'friends' && !searchTerm
                                    ? 'Find people in the "Suggestions" tab!'
                                    : !searchTerm && 'Check back later.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
