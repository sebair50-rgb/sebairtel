
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface PastStream {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    title: string;
    thumbnail: string;
    duration: string;
    endedAt: string;
}

interface PastStreamCardProps {
    stream: PastStream;
}

const PastStreamCard: React.FC<PastStreamCardProps> = ({ stream }) => {
    const router = useRouter();

    const handleCardClick = () => {
        // Here you would navigate to a replay page, for now, it points to the same live page
        router.push(`/live/${stream.id}`);
    };

    return (
        <Card 
            className="w-full overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer group flex flex-col"
            onClick={handleCardClick}
        >
            <div className="relative aspect-video">
                <Image src={stream.thumbnail} alt={stream.title} layout="fill" objectFit="cover" className="group-hover:brightness-90 transition-all" />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{stream.duration}</span>
                </div>
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white/80" />
                </div>
            </div>
             <CardContent className="p-3 flex items-center gap-3 bg-card flex-1">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={stream.user.avatar} alt={stream.user.name} />
                    <AvatarFallback>{stream.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <p className="font-semibold text-sm truncate">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">{stream.user.name} &middot; {stream.endedAt}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PastStreamCard;
