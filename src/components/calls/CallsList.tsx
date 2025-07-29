
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils';
import type { Call } from '@/lib/types';
import { Button } from '../ui/button';

const CallIcon = ({ type }: { type: Call['type'] }) => {
    switch (type) {
        case 'incoming':
            return <PhoneIncoming className="w-4 h-4 text-green-500" />;
        case 'outgoing':
            return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
        case 'missed':
            return <PhoneMissed className="w-4 h-4 text-red-500" />;
        default:
            return <Phone className="w-4 h-4 text-muted-foreground" />;
    }
};


const CallsList = () => {
    const { calls } = useAppContext();
    const [filter, setFilter] = React.useState<'all' | 'missed'>('all');

    const filteredCalls = filter === 'missed' ? calls.filter(call => call.type === 'missed') : calls;
    
    return (
         <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
                    <TabsList className="grid w-full grid-cols-2 gap-1">
                        <TabsTrigger value="missed">الفائتة</TabsTrigger>
                        <TabsTrigger value="all">كل المكالمات</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {filteredCalls.map(call => (
                                <li key={call.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{call.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className={cn("font-semibold", call.type === 'missed' && 'text-destructive')}>{call.user}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CallIcon type={call.type} />
                                                <span>{call.type === 'incoming' ? 'مكالمة واردة' : call.type === 'outgoing' ? 'مكالمة صادرة' : 'مكالمة فائتة'}</span>
                                                <span>&middot;</span>
                                                <span>{call.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Phone className="text-primary" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

            </div>
        </ScrollArea>
    );
}

export default CallsList;
