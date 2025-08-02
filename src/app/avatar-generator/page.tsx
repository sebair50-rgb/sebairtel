
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Wand2, Check, Camera, Sparkles, Pencil, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/avatar-flow';
import { useAppContext } from '@/store/AppContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const AvatarGeneratorPage = () => {
    const { updateUserProfile, currentUser } = useAppContext();
    const router = useRouter();
    const { toast } = useToast();
    
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [mode, setMode] = useState<'select' | 'ai'>('select');

    const handleGenerateSubmit = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Description field is empty',
                description: 'Please describe the avatar you want to create.',
            });
            return;
        }

        setIsLoading(true);
        setImageUrl(null);

        try {
            const response = await generateAvatar({ prompt });
            setImageUrl(response.imageUrl);
        } catch (error) {
            console.error('Avatar generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to generate the avatar. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAvatar = async () => {
        if (!imageUrl || !currentUser) return;
        setIsSaving(true);
        try {
            await updateUserProfile({}, { avatar: imageUrl });
            toast({
                title: "Avatar Saved!",
                description: "Your new AI-generated avatar has been set.",
            });
            router.push(`/profile/${currentUser.id}`);
        } catch (error) {
            console.error("Failed to save avatar:", error);
            toast({
                variant: "destructive",
                title: "Failed to save avatar",
                description: "An unexpected error occurred. Please try again."
            })
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleFeatureSoon = () => {
        toast({
            title: "Coming Soon!",
            description: "This feature is currently in development and will be available shortly.",
        });
    }

    const renderSelectionScreen = () => (
        <div className="relative h-screen w-screen flex flex-col">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-4 right-4 z-20 bg-black/20 text-white rounded-full">
                <X className="h-5 w-5" />
            </Button>
            <div className="w-full h-1/2 relative">
                 <Image src="https://placehold.co/600x400/c4b5fd/3730a3.png" data-ai-hint="avatar creation" layout="fill" objectFit="cover" alt="Avatar creation" />
            </div>
            <div className="flex-1 bg-background p-6 flex flex-col justify-between rounded-t-3xl -mt-8 z-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">إنشاء الأفاتار الخاص بك</h1>
                    <p className="text-muted-foreground mt-2">
                        اختر الطريقة التي تفضلها لإنشاء صورتك الرمزية الفريدة.
                    </p>
                </div>
                <div className="space-y-3">
                    <Button size="lg" className="w-full" onClick={handleFeatureSoon}>
                         <Camera className="mr-2 h-5 w-5" />
                         إنشاء من سيلفي
                    </Button>
                     <Button size="lg" variant="secondary" className="w-full" onClick={() => setMode('ai')}>
                         <Sparkles className="mr-2 h-5 w-5" />
                         إنشاء بالذكاء الاصطناعي
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleFeatureSoon}>
                         <Pencil className="mr-2 h-5 w-5" />
                         إنشاء يدوي
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    تخضع رسومات الأفاتار لأحكام شروط الخدمة الخاصة بنا.
                </p>
            </div>
        </div>
    );
    
    const renderAiGenerator = () => (
        <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-black p-4 md:p-6">
            <div className="flex items-center mb-4">
                <Button variant="outline" onClick={() => setMode('select')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to options
                </Button>
            </div>
             <div className="max-w-2xl mx-auto w-full">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Create Your Unique Avatar with AI</CardTitle>
                        <CardDescription>
                            Describe the avatar you envision, and our AI will bring it to life. Be creative!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="e.g., A happy cartoon robot, blue and silver, with glowing eyes"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[100px] bg-muted"
                        />
                        <Button onClick={handleGenerateSubmit} disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                 <Wand2 className="mr-2 h-4 w-4" />
                                 Generate Avatar
                                </>
                            )}
                        </Button>
                    </CardContent>

                    {imageUrl && (
                        <CardContent className="flex flex-col items-center gap-4">
                            <CardHeader className="p-0 text-center">
                                <CardTitle>Your Avatar is Ready!</CardTitle>
                                <CardDescription>You can save this as your new profile picture.</CardDescription>
                            </CardHeader>
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                                <Image src={imageUrl} alt={prompt} layout="fill" objectFit="cover" />
                            </div>
                            <Button onClick={handleSaveAvatar} disabled={isSaving} className="w-full">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Save as Profile Picture
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            <motion.div
                 key={mode}
                 initial={{ opacity: 0, x: mode === 'select' ? -300 : 300 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: mode === 'select' ? 300 : -300 }}
                 transition={{ duration: 0.3 }}
            >
                {mode === 'select' ? renderSelectionScreen() : renderAiGenerator()}
            </motion.div>
        </AnimatePresence>
    );
};

export default AvatarGeneratorPage;

