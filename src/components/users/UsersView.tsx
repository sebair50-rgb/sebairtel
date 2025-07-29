
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, UserPlus, Users, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

const UsersView: React.FC = () => {
    const { users, friendRequests, createChat, setSelectedChatId } = useAppContext();

    const handleAddFriend = (userId: string) => {
        // Placeholder for sending friend request
        console.log("Sending friend request to:", userId);
    };

    const handleAcceptRequest = (userId: string) => {
        console.log("Accepting friend request from:", userId);
    };
    
    const handleDeclineRequest = (userId: string) => {
        console.log("Declining friend request from:", userId);
    };

    const handleStartChat = async (userId: string) => {
        const chatId = await createChat(userId);
        if (chatId) {
            setSelectedChatId(chatId);
            // Optionally, switch to the 'contact' tab
        }
    }

    return (
        <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
                 <h1 className="text-2xl font-bold flex items-center gap-2"><Users /> المستخدمون</h1>
                
                {friendRequests.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>طلبات الصداقة</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {friendRequests.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar><AvatarFallback>{user.avatar}</AvatarFallback></Avatar>
                                        <span className="font-semibold">{user.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" onClick={() => handleDeclineRequest(user.id)}><X size={16}/></Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" onClick={() => handleAcceptRequest(user.id)}><Check size={16}/></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>كل المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar><AvatarFallback>{user.avatar}</AvatarFallback></Avatar>
                                    <span className="font-semibold">{user.name}</span>
                                </div>
                                <div>
                                    <Button onClick={() => handleStartChat(user.id)}>بدء محادثة</Button>
                                    {/* Friend button logic can be added here */}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
};

export default UsersView;
