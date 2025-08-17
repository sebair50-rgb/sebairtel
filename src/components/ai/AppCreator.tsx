
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Download, FileCode, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateApp, AppCreatorResponse } from '@/ai/flows/app-creator-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '../chat/CodeBlock';
import Image from 'next/image';

const AppCreator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<AppCreatorResponse | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Description is empty',
                description: 'Please describe the application you want to create.',
            });
            return;
        }

        setIsLoading(true);
        setGeneratedData(null);

        try {
            const response = await generateApp({ prompt });
            setGeneratedData(response);
        } catch (error) {
            console.error('App generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to generate the application. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadAll = () => {
        if (!generatedData?.files) return;
        // In a real app, you'd use a library like JSZip to create a zip file.
        // For this demo, we'll just log the action.
        toast({
            title: 'Download All (Coming Soon)',
            description: 'This feature would package all generated files into a zip archive for download.',
        });
        console.log('Downloading all files:', generatedData.files);
      };

    const generatedFiles = generatedData?.files;
    const previewImageUrl = generatedData?.previewImageUrl;

    return (
        <Card className="shadow-lg animate-fade-in border-0" dir="ltr">
            <CardHeader>
                <CardTitle>AI Application Creator</CardTitle>
                <CardDescription>
                    Describe a simple web application, and the AI will generate the initial boilerplate code using Next.js and Tailwind CSS.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <div className="bg-slate-800 text-slate-100 rounded-lg p-4 font-mono text-sm shadow-inner">
                            <div className="flex items-center gap-2">
                                <span className="text-green-400">$</span>
                                <span className="text-slate-400">create-app</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="A single page app that shows user cards..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="bg-transparent w-full focus:outline-none placeholder:text-slate-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                     <Button type="submit" disabled={isLoading} className="w-full mt-4">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Building App...
                            </>
                        ) : (
                            <>
                                <Bot className="mr-2 h-4 w-4" />
                                Generate Application
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>

            {generatedData && (
                <CardContent className="space-y-4">
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle>Your Application Files</CardTitle>
                            <Button variant="outline" onClick={handleDownloadAll} disabled>
                                <Download className="mr-2 h-4 w-4" />
                                Download All (.zip)
                            </Button>
                        </div>
                        <CardDescription>Review the generated files and preview below.</CardDescription>
                    </div>
                    
                    <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                             <TabsTrigger value="preview">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Preview
                            </TabsTrigger>
                            {generatedFiles && Object.keys(generatedFiles).map(filename => (
                                <TabsTrigger key={filename} value={filename} className="truncate">
                                    <FileCode className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{filename.split('/').pop()}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="preview" className="mt-4">
                            {previewImageUrl ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                                    <Image src={previewImageUrl} alt="Generated App Preview" layout="fill" objectFit="cover" />
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground p-8">
                                    <p>No preview available.</p>
                                </div>
                            )}
                        </TabsContent>

                        {generatedFiles && Object.entries(generatedFiles).map(([filename, content]) => (
                            <TabsContent key={filename} value={filename} className="mt-4">
                                <CodeBlock code={`\`\`\`${filename.split('.').pop()}\n${content}\n\`\`\``} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            )}
        </Card>
    );
};

export default AppCreator;
