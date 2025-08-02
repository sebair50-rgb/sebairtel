
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Wand2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/avatar-flow';
import { useAppContext } from '@/store/AppContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';

const AvatarGeneratorPage = () => {
    const { updateUserProfile, currentUser } = useAppContext();
    const router = useRouter();
    const { toast } = useToast();
    
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleSubmit = async () => {
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
            // The updateUserProfile function needs to be able to handle a base64 data URI
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

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-black">
             <AppHeader title="AI Avatar Generator" icon={Wand2} />
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-2xl mx-auto">
                    <Button variant="outline" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Settings
                    </Button>
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Create Your Unique Avatar</CardTitle>
                            <CardDescription>
                                Describe the avatar you envision, and the AI will bring it to life. Be creative!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="e.g., A happy cartoon robot, blue and silver, with glowing eyes"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[100px] bg-muted"
                            />
                            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
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
        </div>
    );
};

export default AvatarGeneratorPage;
