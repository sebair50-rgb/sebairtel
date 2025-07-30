
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronLeft, MoreHorizontal, Search, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

const UsersView: React.FC = () => {
    const { users, friendRequests, createChat, setSelectedChatId, setActiveTab } = useAppContext();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddFriend = (userId: string) => {
        console.log("Sending friend request to:", userId);
        toast({ description: "تم إرسال طلب الصداقة." });
    };

    const handleAcceptRequest = (userId: string) => {
        console.log("Accepting friend request from:", userId);
        toast({ description: "تم قبول طلب الصداقة." });
    };

    const handleDeclineRequest = (userId: string) => {
        console.log("Declining friend request from:", userId);
        toast({ description: "تم رفض طلب الصداقة." });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserListItem = ({ user }: { user: User }) => (
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
            <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                    <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email?.split('@')[0]}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <Button size="sm" className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 h-9" onClick={() => handleAddFriend(user.id)}>
                    <UserPlus size={16} className="ml-1" />
                    إضافة
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <X size={16}/>
                </Button>
            </div>
        </div>
    );
    
    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
             <header className="bg-white p-4 flex items-center justify-between border-b">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    إضافة الأصدقاء
                    <ChevronDown size={20} />
                </h1>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </header>

            <div className="p-4">
                 <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث..."
                        className="w-full rounded-full bg-white h-12 pr-12 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 pt-0 space-y-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="font-bold">دعوة أصدقائك.</p>
                                <ChevronLeft className="text-muted-foreground"/>
                            </div>
                        </CardContent>
                    </Card>

                    {friendRequests.length > 0 && (
                        <div>
                             <h2 className="font-bold text-base px-2 mb-2 flex justify-between items-center">
                                طلبات صداقة جديدة
                                <Badge className="bg-red-500">{friendRequests.length}</Badge>
                            </h2>
                            <div className="space-y-2">
                                {friendRequests.map(user => (
                                     <div key={user.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                                                <AvatarFallback>{user.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">طلب صداقة</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="rounded-full h-9" onClick={() => handleAcceptRequest(user.id)}>
                                                قبول
                                            </Button>
                                            <Button size="sm" variant="secondary" className="rounded-full h-9" onClick={() => handleDeclineRequest(user.id)}>
                                                رفض
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h2 className="font-bold text-base px-2 mb-2 flex justify-between items-center">
                            بحث عن أصدقاء
                            <Badge className="bg-red-500">7 جديد</Badge>
                        </h2>
                        <p className="text-xs text-muted-foreground px-2 mb-3">
                            مستخدمو التطبيق الذين قد تعرفهم يظهرون هنا.
                        </p>
                         <div className="space-y-2">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => <UserListItem key={user.id} user={user} />)
                            ) : (
                                <p className="text-center text-muted-foreground p-4">لا يوجد مستخدمون مطابقون لبحثك.</p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default UsersView;
