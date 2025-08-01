
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processCode } from '@/ai/flows/code-flow';
import CodeResponse from './CodeResponse';

type AIAction = 'explain' | 'fix' | 'optimize';

const CodeAnalyzer = () => {
    const [code, setCode] = useState('');
    const [task, setTask] = useState<AIAction>('explain');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!code.trim()) {
            toast({
                variant: 'destructive',
                title: 'Code field is empty',
                description: 'Please enter a code snippet to analyze.',
            });
            return;
        }

        setIsLoading(true);
        setAiResponse(null);

        try {
            const response = await processCode({ code, task });
            setAiResponse(response.result);
        } catch (error) {
            console.error('AI action failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to process the request. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>AI Code Analyzer</CardTitle>
                <CardDescription>
                    Enter any code snippet (like Javascript, HTML, Python) and choose the desired task.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs value={task} onValueChange={(value) => setTask(value as AIAction)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="explain">Explain</TabsTrigger>
                        <TabsTrigger value="fix">Debug</TabsTrigger>
                        <TabsTrigger value="optimize">Optimize</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="font-code">
                    <Textarea
                        placeholder="...Paste your code here"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[200px] text-left bg-muted"
                        dir="ltr"
                    />
                </div>
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Code'
                    )}
                </Button>
            </CardContent>

            {aiResponse && (
                <>
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeResponse response={aiResponse} />
                    </CardContent>
                </>
            )}
        </Card>
    );
};

export default CodeAnalyzer;
