
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, MessageCircle, MoreHorizontal, Search, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

const UsersView: React.FC = () => {
    const { users, friends, createChat, setSelectedChatId, setActiveTab, currentUser } = useAppContext();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const handleStartChat = async (userId: string) => {
        const chatId = await createChat(userId);
        if (chatId) {
            setSelectedChatId(chatId);
            setActiveTab('contact');
        } else {
            toast({ variant: 'destructive', description: 'حدث خطأ أثناء محاولة بدء المحادثة.' });
        }
    };

    const friendIds = new Set(friends.map(f => f.id));
    const suggestedUsers = users.filter(user => 
        !friendIds.has(user.id) &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredFriends = friends.filter(friend => 
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserItem = ({ user, isFriend }: { user: User, isFriend: boolean }) => (
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                    <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email?.split('@')[0]}</p>
                </div>
            </div>
            {isFriend ? (
                 <Button size="sm" variant="secondary" className="rounded-full h-9" onClick={() => handleStartChat(user.id)}>
                    <MessageCircle size={16} className="ml-1" />
                    مراسلة
                </Button>
            ) : (
                <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-9" onClick={() => handleStartChat(user.id)}>
                    <UserPlus size={16} className="ml-1" />
                    إضافة
                </Button>
            )}
        </div>
    );
    
    if (!currentUser) {
        return null; // Or a loading state
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
             <header className="bg-white p-4 flex items-center justify-between border-b">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    إضافة الأصدقاء
                </h1>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </header>

            <div className="p-4">
                 <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن أصدقاء..."
                        className="w-full rounded-full bg-white h-12 pr-12 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 pt-0 space-y-6">
                    {searchTerm === '' && (
                         <Card className="rounded-2xl shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold">دعوة أصدقائك.</p>
                                    <ChevronLeft className="text-muted-foreground"/>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {filteredFriends.length > 0 && (
                        <div>
                             <h2 className="font-bold text-base px-2 mb-2 flex justify-between items-center">
                                أصدقائي
                                <Badge variant="secondary">{filteredFriends.length}</Badge>
                            </h2>
                            <div className="space-y-2">
                                {filteredFriends.map(user => <UserItem key={user.id} user={user} isFriend={true} />)}
                            </div>
                        </div>
                    )}
                    
                    {suggestedUsers.length > 0 && (
                        <div>
                            <h2 className="font-bold text-base px-2 mb-2 mt-4 flex justify-between items-center">
                                أشخاص قد تعرفهم
                            </h2>
                            <div className="space-y-2">
                                {suggestedUsers.map(user => <UserItem key={user.id} user={user} isFriend={false} />)}
                            </div>
                        </div>
                    )}

                    {searchTerm !== '' && filteredFriends.length === 0 && suggestedUsers.length === 0 && (
                        <p className="text-center text-muted-foreground p-8">
                            لا يوجد مستخدمون يطابقون بحثك.
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
