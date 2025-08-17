
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateApp, AppCreatorResponse } from '@/ai/flows/app-creator-flow';
import { 
    Bot, Menu, Download, Share2, Trash2, Copy, Play, Settings, RefreshCw, Save, CodeXml, Eye, Github
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import CodeBlock from '../chat/CodeBlock';
import Image from 'next/image';

const AppCreator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [appName, setAppName] = useState('My Awesome App');
    const [generatedResult, setGeneratedResult] = useState<AppCreatorResponse | null>(null);
    const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { toast } = useToast();

    const handleGenerateApp = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Prompt is empty',
                description: 'Please describe the application you want to create.',
            });
            return;
        }

        setIsLoading(true);
        setGeneratedResult(null);
        setIsChatOpen(false);

        try {
            const response = await generateApp({ prompt });
            setGeneratedResult(response);
            setActiveView('preview'); // Default to preview after generation
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
    
    const handleFeatureSoon = (featureName: string) => {
        toast({
            title: `Coming Soon: ${featureName}`,
            description: "We're working hard to add this feature. Stay tuned!",
        });
    }

    const renderMenu = () => (
        <>
            <SheetHeader>
                <SheetTitle>App Actions</SheetTitle>
                <SheetDescription>Manage your generated application.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-4">
                <Button variant="outline" className="justify-start" onClick={() => handleFeatureSoon('Publish to GitHub')}>
                    <Github className="mr-2 h-4 w-4" /> Publish to GitHub
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleFeatureSoon('Download Files')}>
                    <Download className="mr-2 h-4 w-4" /> Download Files
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleFeatureSoon('Share App')}>
                    <Share2 className="mr-2 h-4 w-4" /> Share App
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleFeatureSoon('Save App')}>
                    <Save className="mr-2 h-4 w-4" /> Save App
                </Button>
                 <Separator className="my-2" />
                <Button variant="outline" className="justify-start" onClick={() => {
                    setGeneratedResult(null);
                    setPrompt('');
                }}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
                 <Button variant="destructive" className="justify-start" onClick={() => handleFeatureSoon('Delete App')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete App
                </Button>
            </div>
        </>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <Bot size={48} className="animate-bounce" />
                    <h3 className="text-xl font-bold">Building your vision...</h3>
                    <p className="text-muted-foreground">The AI is generating your files, this might take a moment.</p>
                    <Skeleton className="w-3/4 h-8" />
                    <Skeleton className="w-1/2 h-8" />
                </div>
            );
        }
        
        if (!generatedResult) {
            return (
                 <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Bot size={48} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Welcome to the App Creator</h3>
                    <p className="text-muted-foreground max-w-md">
                        Describe the web application you want to build, and let our AI generate the foundation for you. Click the button below to get started.
                    </p>
                </div>
            )
        }

        if (activeView === 'preview') {
            return (
                 <div className="w-full h-full bg-slate-100 dark:bg-slate-800 p-4">
                     <Image 
                        src={generatedResult.previewImageUrl} 
                        alt="App preview" 
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                    />
                </div>
            )
        }
        
        if (activeView === 'code') {
            return (
                 <Tabs defaultValue={Object.keys(generatedResult.files)[3]} className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        {Object.keys(generatedResult.files).map(filename => (
                            <TabsTrigger key={filename} value={filename}>{filename.replace('src/app/', '')}</TabsTrigger>
                        ))}
                    </TabsList>
                    {Object.entries(generatedResult.files).map(([filename, content]) => (
                         <TabsContent key={filename} value={filename} className="flex-1 overflow-y-auto">
                            <CodeBlock code={`\`\`\`tsx\n${content}\n\`\`\``} />
                        </TabsContent>
                    ))}
                </Tabs>
            )
        }

        return null;
    }

    return (
        <Card className="shadow-lg animate-fade-in w-full h-full flex flex-col" dir="ltr">
            <header className="flex items-center justify-between p-2 border-b">
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        {renderMenu()}
                    </SheetContent>
                </Sheet>
                 <h1 className="font-semibold">{appName}</h1>
                <div className="w-10"></div>
            </header>
            
            <main className="flex-1 bg-muted/20 relative min-h-0">
                {renderContent()}
            </main>

             <footer className="p-2 border-t flex items-center justify-between bg-card">
                 <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full">
                            <Bot className="mr-2" />
                            Chat with Gemini
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Describe Your App</DialogTitle>
                             <DialogDescription>
                                Be as descriptive as possible. Mention the purpose, key features, and any specific design ideas.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="font-code bg-slate-900 text-slate-100 rounded-lg p-4 space-y-2">
                             <div className="flex items-center gap-2">
                                <span className="text-green-400">$</span>
                                <Input 
                                    className="bg-transparent border-none text-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                                    placeholder="e.g., a simple pomodoro timer app with a start/stop button..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateApp()}
                                />
                             </div>
                        </div>
                         <Button onClick={handleGenerateApp} disabled={isLoading}>Generate App</Button>
                    </DialogContent>
                </Dialog>
                
                 {generatedResult && (
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-full">
                        <Button size="sm" variant={activeView === 'preview' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => setActiveView('preview')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                        <Button size="sm" variant={activeView === 'code' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => setActiveView('code')}>
                             <CodeXml className="mr-2 h-4 w-4" />
                            Code
                        </Button>
                    </div>
                )}
            </footer>
        </Card>
    );
};

export default AppCreator;
