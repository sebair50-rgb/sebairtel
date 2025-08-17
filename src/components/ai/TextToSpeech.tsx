
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/tts-flow';

const TextToSpeech = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!text.trim()) {
            toast({
                variant: 'destructive',
                title: 'Text is empty',
                description: 'Please enter some text to convert to speech.',
            });
            return;
        }

        setIsLoading(true);
        setAudioUrl(null);

        try {
            const response = await textToSpeech({ text });
            setAudioUrl(response.audioUrl);
        } catch (error) {
            console.error('Text-to-speech failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to generate audio. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>Text-to-Speech Generator</CardTitle>
                <CardDescription>
                    Convert written text into natural-sounding speech.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Type or paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[150px] bg-muted"
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Audio...
                        </>
                    ) : (
                        <>
                            <Mic className="mr-2 h-4 w-4" />
                            Generate Audio
                        </>
                    )}
                </Button>
            </CardContent>

            {audioUrl && (
                <CardContent className="flex flex-col items-center gap-4">
                    <CardHeader className="p-0">
                        <CardTitle>Audio is Ready</CardTitle>
                    </CardHeader>
                    <div className="w-full">
                        <audio ref={audioRef} src={audioUrl} controls className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default TextToSpeech;
