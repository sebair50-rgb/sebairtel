
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Briefcase, Store, Globe, Home } from 'lucide-react';
import LiveFeed from './LiveFeed';
import MarketView from './MarketView';
import StoreView from './StoreView';
import NewsView from './NewsView';
import PublicFeed from './PublicFeed';
import AppHeader from '../layout/AppHeader';
import { useTranslation } from '@/store/LanguageContext';
import { ScrollArea } from '../ui/scroll-area';

const CommunityPosts = () => {
    const { t } = useTranslation();
    const [activeSocialTab, setActiveSocialTab] = useState('feed');

    const socialTabs = [
        { value: 'feed', label: t('socialFeed.feed'), icon: Home },
        { value: 'news', label: t('socialFeed.news'), icon: Globe },
        { value: 'business', label: t('socialFeed.business'), icon: Briefcase },
        { value: 'market', label: t('socialFeed.market'), icon: Store },
        { value: 'live', label: t('socialFeed.live'), icon: Video },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black">
             <Tabs value={activeSocialTab} onValueChange={setActiveSocialTab} className="w-full h-full flex flex-col">
                <div className="bg-background border-b sticky top-0 z-20 shadow-sm">
                    <AppHeader title={t('socialFeed.community')} icon={Home} />
                    <div className="px-4 md:px-6 pb-3 pt-1">
                        <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-muted/50 rounded-xl">
                        {socialTabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="h-10 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                                    <tab.icon className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                        ))}
                        </TabsList>
                    </div>
                </div>
            
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 md:p-8">
                            <TabsContent value="feed" className="mt-0 focus-visible:outline-none">
                                <PublicFeed />
                            </TabsContent>
                            <TabsContent value="live" className="mt-0 focus-visible:outline-none">
                                <LiveFeed />
                            </TabsContent>
                            <TabsContent value="news" className="mt-0 focus-visible:outline-none">
                                <NewsView />
                            </TabsContent>
                            <TabsContent value="business" className="mt-0 focus-visible:outline-none">
                                <MarketView />
                            </TabsContent>
                            <TabsContent value="market" className="mt-0 focus-visible:outline-none">
                                <StoreView />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </div>
             </Tabs>
        </div>
    );
};

export default CommunityPosts;
