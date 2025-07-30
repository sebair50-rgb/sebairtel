"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/store/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';
import Image from 'next/image';

const LiveStreamPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { currentUser, users } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [streamer, setStreamer] = useState<User | null>(null);

    const isMyStream = id === 'me';

    useEffect(() => {
        if(isMyStream) {
            setStreamer(currentUser);
        } else {
            const foundUser = users.find(u => id.includes(u.id));
            setStreamer(foundUser || null);
        }
    }, [id, currentUser, users, isMyStream]);


    useEffect(() => {
        // Only activate camera if it's the user's own stream
        if (!isMyStream) {
            setIsLoading(false);
            return;
        }

        const getCameraPermission = async () => {
            setIsLoading(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasCameraPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'خطأ في الوصول للكاميرا',
                    description: 'الرجاء تمكين أذونات الكاميرا والميكروفون في متصفحك.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        getCameraPermission();

        // Cleanup function to stop tracks when component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMyStream, toast]);

    const handleEndStream = () => {
        router.back();
    };

    if (isLoading) {
        return <LiveStreamSkeleton />;
    }

    const renderStreamContent = () => {
        // User is broadcasting their own stream
        if (isMyStream) {
            if (isVideoOff) {
                 return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4">
                        <Avatar className="w-32 h-32 text-5xl">
                            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xl">الكاميرا متوقفة</p>
                    </div>
                 )
            }
             if (!hasCameraPermission) {
                 return (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <Alert variant="destructive" className="max-w-md">
                            <AlertTitle>الكاميرا غير متاحة</AlertTitle>
                            <AlertDescription>
                                لا يمكن بدء البث المباشر. يرجى السماح بالوصول إلى الكاميرا والميكروفون والمحاولة مرة أخرى.
                            </AlertDescription>
                        </Alert>
                    </div>
                 )
            }
            return <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />;
        }

        // User is watching someone else's stream (placeholder)
        return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                <Image src="https://placehold.co/1280x720/18171F/FFFFFF.png?text=Live+Stream" data-ai-hint="live stream broadcast" alt="Live stream placeholder" width={1280} height={720} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-2xl font-bold text-white/80 backdrop-blur-sm p-4 rounded-lg">
                        {`أنت تشاهد بث ${streamer?.name || 'مستخدم'}`}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white p-4">
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-6 z-20 bg-black/50 backdrop-blur-sm rounded-full"
                onClick={() => router.back()}
            >
                <ArrowRight />
            </Button>
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                {renderStreamContent()}
                
                 <div className="absolute top-4 left-4 z-10">
                    <Card className="bg-black/50 border-none text-white">
                        <CardHeader className="flex flex-row items-center gap-3 p-3">
                             <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={streamer?.avatar} alt={streamer?.name} />
                                    <AvatarFallback>{streamer?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full h-4 w-4 border-2 border-black" />
                            </div>
                            <div>
                                <CardTitle className="text-base">{streamer?.name}</CardTitle>
                                <p className="text-xs font-bold text-red-400">{isMyStream ? 'أنت تبث الآن' : 'يبث الآن'}</p>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                </Button>
                {isMyStream && (
                     <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsVideoOff(!isVideoOff)}>
                        {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
                    </Button>
                )}
                <Button size="icon" className="bg-destructive hover:bg-destructive/90 rounded-full w-20 h-16" onClick={handleEndStream}>
                    <PhoneOff size={28} />
                </Button>
            </div>
        </div>
    );
};

const LiveStreamSkeleton = () => (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl flex items-center justify-center">
            <Skeleton className="w-full h-full" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
            <Skeleton className="rounded-full w-16 h-16" />
            <Skeleton className="rounded-full w-16 h-16" />
            <Skeleton className="rounded-full w-20 h-16" />
        </div>
    </div>
);


export default LiveStreamPage;
