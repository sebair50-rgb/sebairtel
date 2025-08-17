
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Download, FileCode, Image as ImageIcon, Menu, X, Trash2, Save, Share2, Copy, RefreshCw, Upload, Code2, Eye, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateApp, AppCreatorResponse } from '@/ai/flows/app-creator-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '../chat/CodeBlock';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '../ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const AppCreator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<AppCreatorResponse | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
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
        setViewMode('preview');

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

    const handleActionClick = (action: string) => {
        toast({
            title: 'Coming Soon!',
            description: `The "${action}" feature is in development.`
        });
    };

    const generatedFiles = generatedData?.files;
    const previewImageUrl = generatedData?.previewImageUrl;

    const renderMainContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                    <h3 className="text-xl font-bold">Generating your app...</h3>
                    <p>This may take a moment.</p>
                </div>
            );
        }
        if (!generatedData) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <Bot size={64} className="mb-4" />
                    <h2 className="text-2xl font-bold">App Creator</h2>
                    <p>Describe your app in the chat to get started.</p>
                </div>
            )
        }
        if (viewMode === 'preview') {
            return previewImageUrl ? (
                <div className="relative w-full h-full bg-muted">
                    <Image src={previewImageUrl} alt="Generated App Preview" layout="fill" objectFit="contain" className="p-4" />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <ImageIcon size={48} className="mb-4" />
                    <p>No preview available.</p>
                </div>
            );
        }
        if (viewMode === 'code') {
            return (
                 <Tabs defaultValue={generatedFiles ? Object.keys(generatedFiles)[0] : ''} className="w-full h-full flex flex-col">
                    {generatedFiles && (
                        <>
                        <div className="px-4 pt-4">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                            {Object.keys(generatedFiles).map(filename => (
                                <TabsTrigger key={filename} value={filename} className="truncate">
                                    <FileCode className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{filename.split('/').pop()}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {Object.entries(generatedFiles).map(([filename, content]) => (
                                <TabsContent key={filename} value={filename} className="mt-0 p-4">
                                    <CodeBlock code={`\`\`\`${filename.split('.').pop()}\n${content}\n\`\`\``} />
                                </TabsContent>
                            ))}
                        </div>
                        </>
                    )}
                </Tabs>
            )
        }
    }
    
    const menuActions = [
        { id: 'publish', label: 'Publish App', icon: Upload, action: () => handleActionClick('Publish') },
        { id: 'reset', label: 'Reset App', icon: RefreshCw, action: () => { setGeneratedData(null); setPrompt('') } },
        { id: 'copy', label: 'Copy Code', icon: Copy, action: () => handleActionClick('Copy Code') },
        { id: 'download', label: 'Download Files', icon: Download, action: () => handleActionClick('Download') },
        { id: 'share', label: 'Share App', icon: Share2, action: () => handleActionClick('Share') },
        { id: 'save', label: 'Save App', icon: Save, action: () => handleActionClick('Save') },
        { id: 'delete', label: 'Delete App', icon: Trash2, action: () => handleActionClick('Delete'), isDestructive: true },
    ];


    return (
        <div className="h-full w-full bg-slate-900 text-white flex flex-col" dir="ltr">
            {/* Top Bar */}
            <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="ghost" size="icon"><Menu /></Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-slate-900 text-white border-slate-700">
                        <SheetHeader>
                            <SheetTitle className="text-white">App Actions</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-2">
                             {menuActions.map(item => (
                                <SheetClose asChild key={item.id}>
                                <Button
                                    variant={item.isDestructive ? "destructive" : "ghost"}
                                    className="justify-start gap-3"
                                    onClick={item.action}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Button>
                                </SheetClose>
                             ))}
                        </div>
                    </SheetContent>
                </Sheet>
                 <div className="flex-1 text-center">
                    <h1 className="text-lg font-bold truncate">{prompt || "New App"}</h1>
                </div>
                <div className="w-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {renderMainContent()}
            </main>

            {/* Bottom Bar */}
            <footer className="p-3 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center justify-center gap-2">
                    <Dialog onOpenChange={(isOpen) => !isOpen && handleSubmit()}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="lg" className="flex-1 max-w-sm">
                                <Bot className="mr-2"/>
                                Chat with Gemini
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 text-white">
                            <DialogHeader>
                                <DialogTitle>Create Your App</DialogTitle>
                                <DialogDescription>
                                    Describe the application you want to build. Be as specific as you can!
                                </DialogDescription>
                            </DialogHeader>
                             <div className="relative">
                                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm shadow-inner">
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
                                            onKeyDown={(e) => { if(e.key === 'Enter') handleSubmit(e) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    <div className="flex items-center rounded-full bg-slate-700 p-1">
                        <Button 
                            size="sm"
                            variant={viewMode === 'preview' ? 'secondary' : 'ghost'} 
                            onClick={() => setViewMode('preview')} 
                            className="rounded-full"
                            disabled={!generatedData}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                         <Button 
                            size="sm"
                            variant={viewMode === 'code' ? 'secondary' : 'ghost'} 
                            onClick={() => setViewMode('code')} 
                            className="rounded-full"
                             disabled={!generatedData}
                        >
                            <Code2 className="mr-2 h-4 w-4" />
                            Code
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppCreator;
