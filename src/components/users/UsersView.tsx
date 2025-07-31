
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MessageSquare, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface UsersViewProps {
  setActiveTab: (tab: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ setActiveTab }) => {
    const { friends, suggestedUsers, createChat, setSelectedChatId, sendFriendRequest } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { toast } = useToast();
    const [activeList, setActiveList] = useState<'suggestions' | 'friends'>('friends');
    const router = useRouter();

    const handleAddFriend = async (user: UserType) => {
        try {
            await sendFriendRequest(user);
            toast({
                title: "تم إرسال الطلب!",
                description: `تم إرسال طلب صداقة إلى ${user.name}.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "حدث خطأ",
                description: "لم نتمكن من إرسال طلب الصداقة. يرجى المحاولة مرة أخرى.",
            });
        }
    };
    
    const handleMessageFriend = async (user: UserType) => {
        const chat = await createChat(user);
        if (chat) {
            setSelectedChatId(chat.id);
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
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
                <div className="flex-1 text-right overflow-hidden">
                    <p className="font-bold text-lg truncate">{user.name}</p>
                </div>
            </div>
            {action === 'add' ? (
                 <Button 
                    className="bg-primary hover:bg-primary/90" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleAddFriend(user); }}
                    disabled={user.requestSent}
                >
                    {user.requestSent ? <Check size={16} className="ml-1" /> : <UserPlus size={16} className="ml-1" />}
                    {user.requestSent ? 'تم الإرسال' : 'إضافة'}
                </Button>
            ) : (
                <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={(e) => { e.stopPropagation(); handleMessageFriend(user); }}>
                    <MessageSquare size={16} className="ml-1" />
                    مراسلة
                </Button>
            )}
        </motion.div>
    );

    return (
        <div className="w-full flex flex-col h-full bg-white">
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
                                className="w-full rounded-full bg-slate-100 h-12 pr-12 text-base border-slate-200 focus:border-primary"
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
                    <h2 className="text-lg font-semibold text-muted-foreground mb-2">{title}</h2>
                    {listToShow.length > 0 ? (
                        <div className="divide-y">
                             <AnimatePresence>
                                {listToShow.map(user => (
                                    <UserCard 
                                        key={user.id} 
                                        user={user} 
                                        action={activeList === 'friends' ? 'message' : 'add'} 
                                    />
                                ))}
                            </AnimatePresence>
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
