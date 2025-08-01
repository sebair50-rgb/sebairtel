
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, PlusCircle } from 'lucide-react';
import LiveStreamCard, { type LiveStream } from './LiveStreamCard';
import { useAppContext } from '@/store/AppContext';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import PastStreamCard, { type PastStream } from './PastStreamCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LiveFeed = () => {
    const { users } = useAppContext();
    const router = useRouter();

    const handleGoLive = () => {
        router.push('/live/me');
    };

    // Placeholder data for live streams
    const streams: LiveStream[] = users.slice(0, 3).map((user, index) => ({
        id: `live_${user.id}`,
        user: { name: user.name, avatar: user.avatar },
        title: `Live stream about programming with ${user.name}`,
        thumbnail: `https://placehold.co/600x400/18171F/FFFFFF.png?text=Live+${index + 1}`,
        viewers: Math.floor(Math.random() * 2000) + 50,
    }));
    
    const pastStreams: PastStream[] = users.slice(3, 7).map((user, index) => ({
        id: `past_live_${user.id}`,
        user: { name: user.name, avatar: user.avatar },
        title: `How to build a great UI - by ${user.name}`,
        thumbnail: `https://placehold.co/600x400/4c566a/e5e9f0.png?text=Past+Stream+${index + 1}`,
        duration: `${Math.floor(Math.random() * 50) + 10}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
        endedAt: `${Math.floor(Math.random() * 6) + 2} hours ago`
    }));


    return (
        <div className="space-y-8">
            <Card className="shadow-lg">
                <div className="flex justify-between items-center bg-card p-4 rounded-xl">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold">Join the Live Stream</h2>
                        <p className="text-muted-foreground">Watch or start your own stream now.</p>
                    </div>
                    <Button onClick={handleGoLive} size="lg" className="rounded-full">
                        <PlusCircle className="mr-2" />
                        Start Live Stream
                    </Button>
                </div>
            </Card>

            <Tabs defaultValue="now" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="now">Happening Now</TabsTrigger>
                    <TabsTrigger value="past">Past Streams</TabsTrigger>
                </TabsList>
                <TabsContent value="now" className="mt-6">
                     {streams.length > 0 ? (
                        <section>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {streams.map(stream => (
                                    <LiveStreamCard key={stream.id} stream={stream} />
                                ))}
                            </div>
                        </section>
                     ) : (
                        <div className="text-center text-muted-foreground pt-16">
                            <Video size={48} className="mx-auto mb-4" />
                            <p className="font-semibold">No live streams at the moment</p>
                            <p className="text-sm">Be the first to start a live stream and share your thoughts!</p>
                        </div>
                     )}
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                    {pastStreams.length > 0 ? (
                        <section>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pastStreams.map(stream => (
                                    <PastStreamCard key={stream.id} stream={stream} />
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className="text-center text-muted-foreground pt-16">
                            <Video size={48} className="mx-auto mb-4" />
                            <p className="font-semibold">No past streams available</p>
                            <p className="text-sm">Saved streams from previous live sessions will appear here.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LiveFeed;
