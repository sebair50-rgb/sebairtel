
"use client";

import React from 'react';
import { Phone, Users, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CallsList from './CallsList';
import UsersView from '../users/UsersView';
import ChatInterface from '../chat/ChatInterface';


interface CallsViewProps {
    defaultTab?: string;
}

const CallsView: React.FC<CallsViewProps> = ({ defaultTab = 'calls' }) => {
    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
             <header className="bg-white p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <Phone className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold">تواصل</h1>
                </div>
            </header>
             <Tabs defaultValue={defaultTab} className="w-full flex flex-col flex-1">
                <div className="px-4 md:px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 gap-2 h-auto bg-slate-200 p-2">
                        <TabsTrigger value="chats" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <MessageSquare className="ml-1 sm:ml-2" />
                            دردشتي
                        </TabsTrigger>
                        <TabsTrigger value="calls" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Phone className="ml-1 sm:ml-2" />
                            مكالماتي
                        </TabsTrigger>
                        <TabsTrigger value="groups" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Users className="ml-1 sm:ml-2" />
                            مجموعاتي
                        </TabsTrigger>
                        <TabsTrigger value="friends" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Users className="ml-1 sm:ml-2" />
                            الأصدقاء
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="calls" className="mt-2 flex-1 px-4 md:px-6">
                    <CallsList />
                </TabsContent>
                 <TabsContent value="chats" className="flex-1">
                    <ChatInterface />
                </TabsContent>
                <TabsContent value="groups" className="mt-2 flex-1">
                    <ComingSoonContent title="المجموعات" icon={Users} />
                </TabsContent>
                <TabsContent value="friends" className="flex-1">
                    <UsersView />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CallsView;
