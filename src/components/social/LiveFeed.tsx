
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, PlusCircle } from 'lucide-react';
import LiveStreamCard, { type LiveStream } from './LiveStreamCard';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import { useRouter } from 'next/navigation';

const LiveFeed = () => {
    const { toast } = useToast();
    const { users } = useAppContext();
    const router = useRouter();

    const handleGoLive = () => {
        // Navigate to a dedicated page for the user to start their own stream
        router.push('/live/me');
    };

    // Placeholder data for live streams
    const streams: LiveStream[] = users.slice(0, 5).map((user, index) => ({
        id: `live_${user.id}`,
        user: { name: user.name, avatar: user.avatar },
        title: `Live stream about programming with ${user.name}`,
        thumbnail: `https://placehold.co/600x400.png?text=Live+${index + 1}`,
        viewers: Math.floor(Math.random() * 2000) + 50,
    }));


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">Join the Live Stream</h2>
                    <p className="text-muted-foreground">Watch or start your own stream now.</p>
                </div>
                <Button onClick={handleGoLive} size="lg" className="rounded-full">
                    <PlusCircle className="mr-2" />
                    Start Live Stream
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
                    <p className="font-semibold">No live streams at the moment</p>
                    <p className="text-sm">Be the first to start a live stream and share your thoughts!</p>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
