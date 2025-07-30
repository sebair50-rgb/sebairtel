
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Mail, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

const UsersView = () => {
    const { friends, suggestedUsers, createChat, setSelectedChatId, setActiveTab } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const handleAddFriend = async (user: User) => {
        const chatId = await createChat(user);
        if (chatId) {
            setActiveTab('contact');
            setSelectedChatId(chatId);
            toast({
                title: "تمت الإضافة بنجاح!",
                description: `لقد بدأت محادثة مع ${user.name}.`,
            });
        }
    };
    
    const handleMessageFriend = async (user: User) => {
        const chatId = await createChat(user); // Will get existing or create new
        if (chatId) {
            setActiveTab('contact');
            setSelectedChatId(chatId);
        }
    };

    const filteredSuggestedUsers = suggestedUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFriends = friends.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full w-full flex flex-col p-4 md:p-0">
            <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="بحث عن أصدقاء..."
                    className="w-full rounded-full bg-white h-12 pr-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-6">
                    {/* Friends List */}
                    {filteredFriends.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-3 px-1">أصدقائي</h2>
                            <div className="space-y-2">
                                {filteredFriends.map(user => (
                                    <Card key={user.id} className="p-3 shadow-sm rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback>{user.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="rounded-full" size="icon" onClick={() => handleMessageFriend(user)}>
                                                <MessageSquare className="text-primary"/>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Users */}
                    {filteredSuggestedUsers.length > 0 && (
                        <div>
                             <h2 className="text-xl font-bold mb-3 px-1">أشخاص قد تعرفهم</h2>
                            <div className="space-y-2">
                                {filteredSuggestedUsers.map(user => (
                                    <Card key={user.id} className="p-3 shadow-sm rounded-xl">
                                        <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback>{user.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="rounded-full" size="icon" onClick={() => handleAddFriend(user)}>
                                                <UserPlus />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
