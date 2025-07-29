
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, ArrowUpRight, ArrowDownLeft, PhoneMissed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import type { Call } from '@/lib/types';

const CallTypeIcon = ({ type }: { type: Call['type'] }) => {
    switch (type) {
        case 'incoming':
            return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
        case 'outgoing':
            return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
        case 'missed':
            return <PhoneMissed className="h-4 w-4 text-red-500" />;
        default:
            return null;
    }
};


const CallsView: React.FC = () => {
    const { calls } = useAppContext();
    const [activeTab, setActiveTab] = useState('all');

    const filteredCalls = calls.filter(call => {
        if (activeTab === 'all') return true;
        return call.type === activeTab;
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 h-full flex flex-col w-full">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Phone /> سجل المكالمات</h1>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value="missed">الفائتة</TabsTrigger>
                    <TabsTrigger value="incoming">الواردة</TabsTrigger>
                    <TabsTrigger value="outgoing">الصادرة</TabsTrigger>
                </TabsList>
                </Tabs>
            </div>
            
            <ScrollArea className="flex-1 mt-4">
                <Card className="flex-1">
                    <CardContent className="p-4 space-y-4">
                        {filteredCalls.length > 0 ? filteredCalls.map(call => (
                            <div key={call.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{call.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className={cn("font-semibold", call.type === 'missed' && "text-red-500")}>{call.user}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CallTypeIcon type={call.type} />
                                            <span>{call.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {call.type !== 'missed' && <span className="text-xs text-muted-foreground">{call.duration}</span>}
                                    <Button variant="ghost" size="icon">
                                        <Phone size={18} className="text-green-500"/>
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-muted-foreground p-8">
                                لا توجد مكالمات في هذا القسم.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ScrollArea>
        </div>
    );
};

export default CallsView;
