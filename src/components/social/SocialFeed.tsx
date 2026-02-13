"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Briefcase, Store, Globe, Home } from 'lucide-react';

import LiveFeed from './LiveFeed';
import MarketView from './MarketView';
import StoreView from './StoreView';
import NewsView from './NewsView';
import AppHeader from '../layout/AppHeader';

const SocialFeed = () => {
    const [activeSocialTab, setActiveSocialTab] = useState('news');

    const socialTabs = [
        { value: 'news', label: 'News', icon: Globe },
        { value: 'business', label: 'Business', icon: Briefcase },
        { value: 'market', label: 'Market', icon: Store },
        { value: 'live', label: 'Live', icon: Video },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black">
             <Tabs value={activeSocialTab} onValueChange={setActiveSocialTab} className="w-full h-full flex flex-col">
                <div className="bg-background border-b sticky top-0 z-10">
                    <AppHeader title="Community" icon={Home} />
                    <div className="px-4 md:px-6 pb-2">
                        <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-amber-100 dark:bg-stone-900">
                        {socialTabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="py-2 text-xs sm:text-sm data-[state=active]:shadow-md">
                                    <tab.icon className="mr-1 sm:mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                        ))}
                        </TabsList>
                    </div>
                </div>
            
                <div className="flex-1 overflow-y-auto">
                    <TabsContent value="live" className="mt-0 p-4 md:p-6">
                        <LiveFeed />
                    </TabsContent>
                    <TabsContent value="news" className="mt-0 p-4 md:p-6">
                        <NewsView />
                    </TabsContent>
                    <TabsContent value="business" className="mt-0 p-4 md:p-6">
                        <MarketView />
                    </TabsContent>
                    <TabsContent value="market" className="mt-0 p-4 md:p-6">
                        <StoreView />
                    </TabsContent>
                </div>
             </Tabs>
        </div>
    );
};

export default SocialFeed;
