
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateApp } from '@/ai/flows/app-creator-flow';
import type { AppCreatorResponse } from '@/ai/flows/app-creator-flow';
import { 
    Bot, Download, Share2, Trash2, CodeXml, Eye, Github, RefreshCw, Save, Wand2, Loader2 
} from 'lucide-react';
import Image from 'next/image';
import CodeBlock from '../chat/CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const AppCreator = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AppCreatorResponse | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Prompt is empty',
                description: 'Please describe the application you want to build.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateApp({ prompt });
            setResult(response);
            toast({
                title: 'App Generated!',
                description: 'Your new application files and preview are ready.',
            });
        } catch (error) {
            console.error('App generation failed:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setPrompt('');
        setResult(null);
        setIsLoading(false);
    };

    const handleFeatureSoon = (featureName: string) => {
        toast({
            title: `Coming Soon: ${featureName}`,
            description: "We're working hard to add this feature. Stay tuned!",
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4 md:p-6" dir="ltr">
            {/* Input & Configuration Panel */}
            <Card className="shadow-lg flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle>AI Application Generator</CardTitle>
                            <CardDescription>Describe the app you want to build, and Gemini will generate it for you.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <Textarea
                        placeholder="e.g., A simple and elegant calculator app with a dark theme. It should have buttons for numbers 0-9, basic arithmetic operations (+, -, *, /), a clear button, and an equals button. The display should show the current input and result."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[200px] flex-1 bg-muted"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating App...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Application
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                             <RefreshCw className="mr-2 h-4 w-4" />
                             Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="shadow-lg flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Generated Application</CardTitle>
                            <CardDescription>View the generated files and a preview of your app.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleFeatureSoon('Download ZIP')}><Download/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleFeatureSoon('Deploy')}><Github/></Button>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent className="flex-1 overflow-hidden">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p className="font-semibold">Building your application...</p>
                            <p className="text-sm">This may take a moment.</p>
                        </div>
                    )}
                    {result ? (
                        <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="preview"><Eye className="mr-2" />Preview</TabsTrigger>
                                <TabsTrigger value="code"><CodeXml className="mr-2" />Code</TabsTrigger>
                            </TabsList>
                            <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
                                 <Image src={result.previewImageUrl} alt="App preview" width={800} height={600} className="w-full h-auto rounded-lg border" />
                            </TabsContent>
                            <TabsContent value="code" className="flex-1 overflow-hidden mt-2">
                                <Tabs defaultValue="page.tsx" className="w-full h-full flex flex-col">
                                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 shrink-0">
                                        {Object.keys(result.files).map(filename => (
                                            <TabsTrigger key={filename} value={filename}>{filename.replace('src/app/', '')}</TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {Object.entries(result.files).map(([filename, content]) => (
                                        <TabsContent key={filename} value={filename} className="flex-1 overflow-y-auto">
                                            <CodeBlock code={`\`\`\`tsx\n${content}\n\`\`\``} />
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </TabsContent>
                        </Tabs>
                    ) : (
                         !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                                <p>Your generated application preview and code will appear here once you provide a description and click "Generate".</p>
                            </div>
                         )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AppCreator;
