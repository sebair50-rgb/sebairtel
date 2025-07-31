"use client";

import React, { useEffect } from 'react';
import { Phone, Users, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CallsList from './CallsList';
import ChatInterface from '../chat/ChatInterface';
import UsersView from '../users/UsersView';
import { useAppContext } from '@/store/AppContext';
import { MessageSquare } from 'lucide-react';

interface CallsViewProps {
  setActiveTab: (tab: string) => void;
}

const CallsView: React.FC<CallsViewProps> = ({ setActiveTab }) => {
    const { selectedChatId, initialContactTab, setInitialContactTab } = useAppContext();
    const [activeSubTab, setActiveSubTab] = React.useState(initialContactTab);

    useEffect(() => {
        setActiveSubTab(initialContactTab);
    }, [initialContactTab]);

    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">هذه الميزة ستكون متاحة قريباً!</p>
        </div>
    );

    // If a chat is selected, show the chat interface directly.
    if (selectedChatId) {
        return <ChatInterface />;
    }
    
    const handleTabChange = (value: string) => {
        const tab = value as 'chats' | 'friends';
        setActiveSubTab(tab);
        setInitialContactTab(tab);
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
             <header className="bg-white p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <Phone className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold">تواصل</h1>
                </div>
            </header>
             <Tabs value={activeSubTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-1">
                <div className="px-4 md:px-6 pt-4 bg-white">
                    <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 gap-2 h-auto bg-slate-200 p-2">
                         <TabsTrigger value="chats" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <MessageSquare className="ml-1 sm:ml-2" />
                            دردشتي
                        </TabsTrigger>
                         <TabsTrigger value="friends" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Users className="ml-1 sm:ml-2" />
                            أصدقائي
                        </TabsTrigger>
                         <TabsTrigger value="calls" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Phone className="ml-1 sm:ml-2" />
                            مكالماتي
                        </TabsTrigger>
                        <TabsTrigger value="groups" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <UserCog className="ml-1 sm:ml-2" />
                            مجموعاتي
                        </TabsTrigger>
                    </TabsList>
                </div>
                 <TabsContent value="chats" className="flex-1 bg-white">
                    <ChatInterface />
                </TabsContent>
                 <TabsContent value="friends" className="flex-1 bg-white">
                    <UsersView setActiveTab={setActiveTab} />
                </TabsContent>
                <TabsContent value="calls" className="mt-2 flex-1 px-4 md:px-6">
                    <CallsList />
                </TabsContent>
                 <TabsContent value="groups" className="flex-1 bg-white">
                    <ComingSoonContent title="المجموعات" icon={UserCog} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CallsView;
