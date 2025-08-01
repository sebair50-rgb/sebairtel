
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, UserPlus, MessageSquare } from 'lucide-react';
import { Card } from '../ui/card';
import type { CallStatus, User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CallViewProps {
  status: CallStatus;
  user: User;
  type: 'audio' | 'video';
  onAnswer: () => void;
  onEnd: () => void;
}

const CallView: React.FC<CallViewProps> = ({ status, user, type, onAnswer, onEnd }) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(type === 'audio');

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'connected') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    const getStatusText = () => {
        switch(status) {
            case 'outgoing': return 'Calling...';
            case 'incoming': return 'Incoming call...';
            case 'connected': return formatDuration(duration);
            default: return '';
        }
    }

    const renderCallControls = () => (
         <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </Button>
            {type === 'video' && (
                 <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsVideoOff(!isVideoOff)}>
                    {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
                </Button>
            )}
             <Button size="icon" className="bg-destructive hover:bg-destructive/90 rounded-full w-20 h-16" onClick={onEnd}>
                <PhoneOff size={28} />
            </Button>
             <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16">
                <UserPlus size={28} />
            </Button>
             <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16">
                <MessageSquare size={28} />
            </Button>
        </div>
    )

    const renderIncomingControls = () => (
         <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex flex-col items-center gap-2">
                 <Button size="icon" className="bg-destructive hover:bg-destructive/90 rounded-full w-20 h-16" onClick={onEnd}>
                    <PhoneOff size={28} />
                </Button>
                <span className="text-white">Decline</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full w-20 h-16" onClick={onAnswer}>
                    <Phone size={28} />
                </Button>
                <span className="text-white">Accept</span>
            </div>
        </div>
    )


  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <Card className={cn(
            "w-full h-full max-w-4xl max-h-[800px] bg-cover bg-center rounded-2xl shadow-2xl flex flex-col justify-between p-8 text-white relative",
            "bg-[url('https://placehold.co/800x1200/222/666.png?text=BG')] data-ai-hint='abstract background'"
            )}>
            
            <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>

            {type === 'video' && status === 'connected' && (
                <>
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    {!isVideoOff && <img src="https://placehold.co/800x1200/333/777.png?text=Remote" className="w-full h-full object-cover" data-ai-hint="person talking" />}
                </div>
                <div className="absolute top-4 left-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/50">
                     <img src="https://placehold.co/200x300/444/888.png?text=Local" className="w-full h-full object-cover" data-ai-hint="person selfie" />
                </div>
                </>
            )}

            <div className="relative z-10 flex items-center justify-between">
                <div className="text-lg font-semibold">{status === 'connected' ? 'Call in Progress' : ''}</div>
                <Button variant="ghost" size="icon" className="text-white"><Maximize /></Button>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center -mt-16">
                 <Avatar className={cn("h-32 w-32 border-4 border-white/50 shadow-lg", status === 'outgoing' && 'animate-pulse')}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-5xl">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mt-4">{user.name}</h1>
                <p className="text-xl text-white/80 mt-2">{getStatusText()}</p>
            </div>

             <div className="relative z-10">
                {status === 'incoming' ? renderIncomingControls() : renderCallControls()}
            </div>
        </Card>
    </motion.div>
  );
};

export default CallView;
