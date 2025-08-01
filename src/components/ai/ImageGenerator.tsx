
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/image-flow';
import Image from 'next/image';

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Description field is empty',
                description: 'Please enter a description for the image you want to create.',
            });
            return;
        }

        setIsLoading(true);
        setImageUrl(null);

        try {
            const response = await generateImage({ prompt });
            setImageUrl(response.imageUrl);
        } catch (error) {
            console.error('Image generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to generate the image. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>AI Image Generator</CardTitle>
                <CardDescription>
                    Write a detailed text description of the image you envision, and the AI will bring it to life.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Example: A cat wearing a wizard hat reading a book in an old library"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-muted"
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Image...
                        </>
                    ) : (
                        'Create Image'
                    )}
                </Button>
            </CardContent>

            {imageUrl && (
                <CardContent className="flex flex-col items-center gap-4">
                    <CardHeader className="p-0">
                        <CardTitle>Your Image is Ready!</CardTitle>
                    </CardHeader>
                    <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border">
                         <Image src={imageUrl} alt={prompt} layout="fill" objectFit="cover" />
                    </div>
                     <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                    </Button>
                </CardContent>
            )}
        </Card>
    );
};

export default ImageGenerator;
