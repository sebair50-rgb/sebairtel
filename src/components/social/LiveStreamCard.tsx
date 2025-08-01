
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Radio } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface LiveStream {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    title: string;
    thumbnail: string;
    viewers: number;
}

interface LiveStreamCardProps {
    stream: LiveStream;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream }) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/live/${stream.id}`);
    };

    return (
        <Card 
            className="w-full overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer group"
            onClick={handleCardClick}
        >
            <div className="relative aspect-[16/9]">
                <Image src={stream.thumbnail} alt={stream.title} layout="fill" objectFit="cover" className="group-hover:brightness-90 transition-all" data-ai-hint="person streaming" />
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Live</span>
                </div>
                 <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-bold">
                    <Eye className="w-4 h-4" />
                    <span>{stream.viewers.toLocaleString()}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <h3 className="font-bold text-white text-lg truncate">{stream.title}</h3>
                </div>
            </div>
             <CardContent className="p-3 flex items-center gap-3 bg-card">
                <Avatar>
                    <AvatarImage src={stream.user.avatar} alt={stream.user.name} />
                    <AvatarFallback>{stream.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{stream.user.name}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default LiveStreamCard;
