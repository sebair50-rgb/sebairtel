"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, PlusCircle } from 'lucide-react';
import LiveStreamCard, { type LiveStream } from './LiveStreamCard';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';

const LiveFeed = () => {
    const { toast } = useToast();
    const { users } = useAppContext();

    const handleGoLive = () => {
        toast({
            title: "بث مباشر",
            description: "سيتم تفعيل ميزة بدء البث المباشر قريبًا!",
        });
    };

    // Placeholder data for live streams
    const streams: LiveStream[] = users.slice(0, 5).map((user, index) => ({
        id: `live_${index + 1}`,
        user: { name: user.name, avatar: user.avatar },
        title: `بث مباشر عن البرمجة مع ${user.name}`,
        thumbnail: `https://placehold.co/600x400.png?text=Live+${index + 1}`,
        viewers: Math.floor(Math.random() * 2000) + 50,
    }));


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">انضم إلى البث المباشر</h2>
                    <p className="text-muted-foreground">شاهد أو ابدأ البث الخاص بك الآن.</p>
                </div>
                <Button onClick={handleGoLive} size="lg" className="rounded-full">
                    <PlusCircle className="ml-2" />
                    ابدأ بث مباشر
                </Button>
            </div>
            
            {streams.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streams.map(stream => (
                        <LiveStreamCard key={stream.id} stream={stream} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-16">
                    <Video size={48} className="mx-auto mb-4" />
                    <p className="font-semibold">لا يوجد أي بث مباشر حاليًا</p>
                    <p className="text-sm">كن أول من يبدأ بثًا مباشرًا وشارك أفكارك!</p>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
