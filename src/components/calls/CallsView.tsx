
"use client";

import React, { useEffect } from 'react';
import { Phone, Users, UserCog, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CallsList from './CallsList';
import ChatInterface from '../chat/ChatInterface';
import UsersView from '../users/UsersView';
import { useAppContext } from '@/store/AppContext';
import { MessageSquare } from 'lucide-react';
import AppHeader from '../layout/AppHeader';
import { useTranslation } from '@/store/LanguageContext';

interface CallsViewProps {
  setActiveTab: (tab: string) => void;
}

const CallsView: React.FC<CallsViewProps> = ({ setActiveTab }) => {
    const { selectedChatId, initialContactTab, setInitialContactTab, friendRequests } = useAppContext();
    const [activeSubTab, setActiveSubTab] = React.useState(initialContactTab);
    const { t } = useTranslation();

    useEffect(() => {
        setActiveSubTab(initialContactTab);
    }, [initialContactTab]);

    const ComingSoonContent = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-16">
            <Icon size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">{t('callsView.comingSoon')}</p>
        </div>
    );

    // If a chat is selected, show the chat interface directly.
    if (selectedChatId) {
        return <ChatInterface />;
    }
    
    const handleTabChange = (value: string) => {
        const tab = value as 'chats' | 'friends' | 'requests';
        setActiveSubTab(tab);
        setInitialContactTab(tab);
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-100">
             <AppHeader title={t('callsView.contact')} icon={Phone} />
             <Tabs value={activeSubTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-1">
                <div className="px-4 md:px-6 pt-4 bg-background border-b">
                    <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 gap-2 h-auto bg-amber-100 dark:bg-stone-900 p-2">
                         <TabsTrigger value="chats" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <MessageSquare className="mr-1 sm:mr-2" />
                            {t('callsView.myChats')}
                        </TabsTrigger>
                         <TabsTrigger value="friends" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Users className="mr-1 sm:mr-2" />
                            {t('callsView.myFriends')}
                        </TabsTrigger>
                         <TabsTrigger value="calls" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <Phone className="mr-1 sm:mr-2" />
                            {t('callsView.myCalls')}
                        </TabsTrigger>
                        <TabsTrigger value="groups" className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                            <UserCog className="mr-1 sm:mr-2" />
                            {t('callsView.myGroups')}
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
                    <ComingSoonContent title={t('callsView.myGroups')} icon={UserCog} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CallsView;
