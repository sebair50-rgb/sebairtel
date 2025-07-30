
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ArrowRight, Send, Maximize, Minimize, MessageSquare, MessageSquareOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/store/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const LiveChatPanel = ({ messages, newMessage, setNewMessage, handleSendMessage, isOverlay = false }) => (
    <div className={cn(
        "flex flex-col",
        isOverlay 
            ? "bg-black/70 backdrop-blur-sm h-1/3 w-full absolute bottom-0 left-0 z-20"
            : "w-full md:w-96 h-1/2 md:h-full bg-slate-900 border-l border-slate-700"
    )}>
        <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-center">الدردشة المباشرة</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 text-sm">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-primary">{msg.user.name}</p>
                            <p className="text-white/90">{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
         <Separator className="bg-slate-700" />
         <div className="p-4">
             <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input 
                    placeholder="اكتب تعليقًا..." 
                    className="bg-slate-800 border-slate-600 rounded-full text-white" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                    <Send />
                </Button>
             </form>
         </div>
    </div>
);


const LiveStreamPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { currentUser, users } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [streamer, setStreamer] = useState<User | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showChatInFullScreen, setShowChatInFullScreen] = useState(true);


    const isMyStream = id === 'me';
    
    // Mock chat messages
    const [messages, setMessages] = useState([
        { id: 1, user: { name: "علي" }, text: "بث رائع!" },
        { id: 2, user: { name: "فاطمة" }, text: "شكرًا على المعلومات القيمة." },
        { id: 3, user: { name: "محمد" }, text: "هل يمكنك شرح النقطة الأخيرة مرة أخرى؟" },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            setMessages([...messages, { id: Date.now(), user: { name: currentUser.name }, text: newMessage }]);
            setNewMessage("");
        }
    };


    useEffect(() => {
        if(isMyStream) {
            setStreamer(currentUser);
        } else {
            const foundUser = users.find(u => (id as string).includes(u.id));
            setStreamer(foundUser || null);
        }
    }, [id, currentUser, users, isMyStream]);


    useEffect(() => {
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

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMyStream, toast]);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);


    const handleExitActions = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        router.back();
    };

    const handleToggleFullScreen = () => {
        if (!videoContainerRef.current) return;

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (isLoading) {
        return <LiveStreamSkeleton />;
    }

    const renderStreamContent = () => {
        if (isMyStream) {
            if (isVideoOff) {
                 return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4">
                        <Avatar className="w-32 h-32 text-5xl">
                            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xl text-white">الكاميرا متوقفة</p>
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
        <div className="w-full h-screen bg-black flex flex-col md:flex-row items-center justify-center text-white">
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 relative">
                 <AnimatePresence>
                    {!isFullScreen && (
                        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-6 right-6 z-10 bg-black/50 backdrop-blur-sm rounded-full"
                                onClick={handleExitActions}
                            >
                                <ArrowRight />
                            </Button>
                        </motion.div>
                    )}
                 </AnimatePresence>


                <div ref={videoContainerRef} className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                    {renderStreamContent()}

                    <AnimatePresence>
                        {isFullScreen && (
                            <motion.div 
                                className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/70 to-transparent"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" className="bg-black/50 rounded-full" onClick={handleExitActions}><ArrowRight /></Button>
                                        <h3 className="font-bold text-lg">{streamer?.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="bg-black/50 rounded-full" onClick={() => setShowChatInFullScreen(!showChatInFullScreen)}>
                                            {showChatInFullScreen ? <MessageSquareOff /> : <MessageSquare />}
                                        </Button>
                                         <Button variant="ghost" size="icon" className="bg-black/50 rounded-full" onClick={handleToggleFullScreen}><Minimize /></Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                     <div className="absolute top-4 left-4 z-20">
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

                    <AnimatePresence>
                        {!isFullScreen && (
                            <motion.div 
                                className="absolute bottom-4 right-4 z-20"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="bg-black/50 backdrop-blur-sm rounded-full"
                                    onClick={handleToggleFullScreen}
                                >
                                    <Maximize />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                    {isFullScreen && showChatInFullScreen && (
                        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}>
                            <LiveChatPanel
                                messages={messages}
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                handleSendMessage={handleSendMessage}
                                isOverlay={true}
                            />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                {!isFullScreen && (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-4 mt-6">
                        <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                        </Button>
                        {isMyStream && (
                             <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-16 h-16" onClick={() => setIsVideoOff(!isVideoOff)}>
                                {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
                            </Button>
                        )}
                        <Button size="icon" className="bg-destructive hover:bg-destructive/90 rounded-full w-20 h-16" onClick={() => router.back()}>
                            <PhoneOff size={28} />
                        </Button>
                    </motion.div>
                )}
                </AnimatePresence>

            </div>

            <AnimatePresence>
            {!isFullScreen && (
                <motion.div initial={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="w-full md:w-96 h-1/2 md:h-full">
                    <LiveChatPanel
                        messages={messages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                    />
                </motion.div>
            )}
            </AnimatePresence>
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
