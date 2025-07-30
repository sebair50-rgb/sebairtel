
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

    const UserCard = ({ user, action }: { user: User, action: 'add' | 'message' }) => (
         <Card className="p-3 shadow-sm rounded-xl transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
                {action === 'add' ? (
                    <Button variant="secondary" className="rounded-full" size="icon" onClick={() => handleAddFriend(user)}>
                        <UserPlus />
                    </Button>
                ) : (
                    <Button variant="ghost" className="rounded-full text-primary" size="icon" onClick={() => handleMessageFriend(user)}>
                        <MessageSquare/>
                    </Button>
                )}
            </div>
        </Card>
    );

    return (
        <div className="h-full w-full flex flex-col p-4 md:px-6">
            <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                    placeholder="بحث عن أصدقاء..."
                    className="w-full rounded-full bg-white h-12 pr-12 text-base shadow-sm border-2 border-transparent focus-visible:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <ScrollArea className="flex-1 -mx-4">
                <div className="px-4 space-y-6">
                    {/* Friends List */}
                    {filteredFriends.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-3 px-1 text-primary">أصدقائي</h2>
                            <div className="space-y-2">
                                {filteredFriends.map(user => (
                                    <UserCard key={user.id} user={user} action="message" />
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
                                    <UserCard key={user.id} user={user} action="add" />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {filteredFriends.length === 0 && filteredSuggestedUsers.length === 0 && (
                        <div className="text-center text-muted-foreground pt-16">
                            <p>لا يوجد مستخدمون لعرضهم حاليًا.</p>
                            <p>ابحث عن أصدقاء لبدء التواصل!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
