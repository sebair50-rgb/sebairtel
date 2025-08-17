
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/ai/flows/video-flow';

const VideoGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Description is empty',
                description: 'Please enter a description for the video.',
            });
            return;
        }

        setIsLoading(true);
        setVideoUrl(null);

        try {
            const response = await generateVideo({ prompt });
            setVideoUrl(response.videoUrl);
        } catch (error: any) {
            console.error('Video generation failed:', error);
            const errorMessage = error.message || 'An unknown error occurred.';
            let toastDescription = 'Failed to generate the video. Please try again.';

            if (errorMessage.includes('billing enabled')) {
                toastDescription = "Video generation with Veo requires a Google Cloud project with billing enabled. Please enable billing in your GCP project to use this feature.";
            }

            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: toastDescription,
                duration: 9000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!videoUrl) return;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'generated-video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>AI Video Generator</CardTitle>
                <CardDescription>
                    Create a short video clip from a text description. Note: Video generation can take up to a minute.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Example: A majestic dragon soaring over a mystical forest at dawn."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-muted"
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Video... (this may take a minute)
                        </>
                    ) : (
                        <>
                            <Video className="mr-2 h-4 w-4" />
                            Create Video
                        </>
                    )}
                </Button>
            </CardContent>

            {videoUrl && !isLoading && (
                <CardContent className="flex flex-col items-center gap-4">
                    <CardHeader className="p-0">
                        <CardTitle>Your Video is Ready!</CardTitle>
                    </CardHeader>
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border bg-black">
                        <video src={videoUrl} controls autoPlay loop className="w-full h-full">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Video (MP4)
                    </Button>
                </CardContent>
            )}
        </Card>
    );
};

export default VideoGenerator;
