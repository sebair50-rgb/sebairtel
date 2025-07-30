
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils';
import type { Call, User } from '@/lib/types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToast } from '@/hooks/use-toast';

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
    const { calls, initiateCall, users } = useAppContext();
    const [filter, setFilter] = React.useState<'all' | 'missed'>('all');
    const { toast } = useToast();

    const filteredCalls = filter === 'missed' ? calls.filter(call => call.type === 'missed') : calls;

    const handleCall = (call: Call) => {
        const user = users.find(u => u.name === call.user);
        if (user) {
            initiateCall(user, 'audio');
        } else {
            toast({ variant: 'destructive', description: "لم يتم العثور على المستخدم لبدء المكالمة." });
        }
    }
    
    return (
        <div className="h-full w-full flex flex-col">
            <div className="px-4 md:px-0">
                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
                    <TabsList className="grid w-full grid-cols-2 gap-1 bg-slate-200">
                        <TabsTrigger value="missed">الفائتة</TabsTrigger>
                        <TabsTrigger value="all">كل المكالمات</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <ScrollArea className="flex-1 mt-4">
                <div className="space-y-2 px-4 md:px-0">
                    {filteredCalls.map(call => (
                        <Card key={call.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
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
                            <Button variant="ghost" size="icon" className="text-primary rounded-full hover:bg-primary/10" onClick={() => handleCall(call)}>
                                <Phone />
                            </Button>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

export default CallsList;
