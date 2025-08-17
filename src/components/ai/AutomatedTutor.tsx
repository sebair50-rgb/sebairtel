
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askTutor, TutorRequest } from '@/ai/flows/tutor-flow';
import CodeResponse from './CodeResponse';

const AutomatedTutor = () => {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<TutorRequest['level']>('beginner');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!topic.trim()) {
            toast({
                variant: 'destructive',
                title: 'Topic is empty',
                description: 'Please enter a topic or question to learn about.',
            });
            return;
        }

        setIsLoading(true);
        setAiResponse(null);

        try {
            const response = await askTutor({ topic, level });
            setAiResponse(response.explanation);
        } catch (error) {
            console.error('AI tutor action failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to get an explanation. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>AI Tutor</CardTitle>
                <CardDescription>
                    Ask about any topic, and the AI will provide an explanation tailored to your chosen level of expertise.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="e.g., How do black holes work? or What is React.js?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[100px] bg-muted"
                />
                 <Tabs value={level} onValueChange={(value) => setLevel(value as TutorRequest['level'])} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="beginner">Beginner</TabsTrigger>
                        <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Thinking...
                        </>
                    ) : (
                         <>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Explain Topic
                        </>
                    )}
                </Button>
            </CardContent>

            {aiResponse && (
                <>
                    <CardHeader>
                        <CardTitle>Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeResponse response={aiResponse} />
                    </CardContent>
                </>
            )}
        </Card>
    );
};

export default AutomatedTutor;
