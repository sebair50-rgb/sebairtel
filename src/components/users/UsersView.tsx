
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

const UsersView = () => {
    const { friends, suggestedUsers, createChat, setSelectedChatId, setActiveTab } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { toast } = useToast();
    const [activeList, setActiveList] = useState<'suggestions' | 'friends'>('suggestions');

    const handleAddFriend = async (user: UserType) => {
        const chatId = await createChat(user);
        if (chatId) {
            toast({
                title: "تمت الإضافة بنجاح!",
                description: `لقد بدأت محادثة مع ${user.name}.`,
            });
        }
    };
    
    const handleMessageFriend = async (user: UserType) => {
        const chatId = await createChat(user);
        if (chatId) {
            setSelectedChatId(chatId);
            // setActiveTab is now directly from context and will trigger AppShell's state
            setActiveTab('contact'); 
        }
    };

    const filteredSuggestedUsers = suggestedUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFriends = friends.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const listToShow = activeList === 'friends' ? filteredFriends : filteredSuggestedUsers;
    const title = activeList === 'friends' ? `أصدقاؤك (${filteredFriends.length})` : `أشخاص قد تعرفهم (${filteredSuggestedUsers.length})`;


    const UserCard = ({ user, action }: { user: UserType, action: 'add' | 'message' }) => (
         <div 
            className="flex items-center justify-between gap-2 py-3 cursor-pointer"
            onClick={action === 'message' ? () => handleMessageFriend(user) : undefined}
        >
            <Avatar className="h-16 w-16 border">
                <AvatarFallback>{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-right">
                <p className="font-bold text-lg">{user.name}</p>
                 {action === 'add' ? (
                    <div className="flex gap-2 mt-1">
                        <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm" onClick={(e) => { e.stopPropagation(); handleAddFriend(user); }}>
                            <UserPlus size={16} className="ml-1" />
                            إضافة صديق
                        </Button>
                        <Button variant="secondary" className="flex-1" size="sm" onClick={(e) => e.stopPropagation()}>إزالة</Button>
                    </div>
                ) : (
                    <div className="flex gap-2 mt-1">
                         <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); handleMessageFriend(user); }}>
                            <MessageSquare size={16} className="ml-1" />
                            مراسلة
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">الأصدقاء</h1>
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
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="البحث عن أصدقاء..."
                                className="w-full rounded-full bg-slate-200 h-12 pr-12 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
                <div className="flex gap-2 mt-4">
                     <Button 
                        variant={activeList === 'suggestions' ? 'secondary' : 'ghost'} 
                        className="rounded-full"
                        onClick={() => setActiveList('suggestions')}
                    >
                        اقتراحات
                    </Button>
                    <Button 
                        variant={activeList === 'friends' ? 'secondary' : 'ghost'} 
                        className="rounded-full"
                        onClick={() => setActiveList('friends')}
                    >
                        أصدقاؤك
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    {listToShow.length > 0 ? (
                        <div className="divide-y">
                            {listToShow.map(user => (
                                <UserCard 
                                    key={user.id} 
                                    user={user} 
                                    action={activeList === 'friends' ? 'message' : 'add'} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground pt-16">
                            <p className="font-semibold">
                                {searchTerm 
                                    ? `لا توجد نتائج بحث عن "${searchTerm}"`
                                    : (activeList === 'friends' 
                                        ? 'لا يوجد لديك أصدقاء بعد.'
                                        : 'لا توجد اقتراحات جديدة في الوقت الحالي.')
                                }
                            </p>
                            <p className="text-sm">
                                {activeList === 'friends' && !searchTerm
                                    ? 'قم بإضافة أصدقاء لبدء التواصل!'
                                    : !searchTerm && 'تحقق مرة أخرى لاحقًا.'
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
