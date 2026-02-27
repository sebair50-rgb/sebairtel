
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
                <div className="bg-background border-b sticky top-0 z-10">
                    <AppHeader title={t('socialFeed.community')} icon={Home} />
                    <div className="px-4 md:px-6 pb-2">
                        <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-amber-100 dark:bg-stone-900">
                        {socialTabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                                    <tab.icon className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{tab.label}</span>
                                </TabsTrigger>
                        ))}
                        </TabsList>
                    </div>
                </div>
            
                <TabsContent value="feed" className="flex-1 overflow-y-auto mt-0">
                    <div className="p-0 md:p-6">
                        <PublicFeed />
                    </div>
                </TabsContent>
                <TabsContent value="live" className="flex-1 overflow-y-auto mt-0">
                    <div className="p-4 md:p-6">
                        <LiveFeed />
                    </div>
                </TabsContent>
                <TabsContent value="news" className="flex-1 overflow-y-auto mt-0">
                    <div className="p-4 md:p-6">
                        <NewsView />
                    </div>
                </TabsContent>
                <TabsContent value="business" className="flex-1 overflow-y-auto mt-0">
                    <div className="p-4 md:p-6">
                        <MarketView />
                    </div>
                </TabsContent>
                <TabsContent value="market" className="flex-1 overflow-y-auto mt-0">
                    <div className="p-4 md:p-6">
                        <StoreView />
                    </div>
                </TabsContent>
             </Tabs>
        </div>
    );
};

export default CommunityPosts;
