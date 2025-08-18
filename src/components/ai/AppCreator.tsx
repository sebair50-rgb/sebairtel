
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateAgenticResponse } from '@/ai/flows/agentic-app-creator-flow';
import type { AgenticRequest } from '@/ai/flows/agentic-app-creator-flow';
import type { Files } from '@/ai/flows/agentic-app-creator-schemas';
import { 
    Bot, Download, Share2, CodeXml, Eye, Github, RefreshCw, Wand2, Loader2, Send, Split, PanelLeft, X, BrainCircuit
} from 'lucide-react';
import Image from 'next/image';
import CodeBlock from '../chat/CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import useIsMobile from '@/hooks/use-is-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ViewMode = 'preview' | 'code' | 'split';
type MobileView = 'chat' | 'output';

const AppCreator = () => {
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [conversation, setConversation] = useState<AgenticRequest['history']>([]);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState<Files | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [activeFile, setActiveFile] = useState<string>('src/app/page.tsx');
    const [model, setModel] = useState('googleai/gemini-1.5-flash');
    
    const [viewMode, setViewMode] = useState<ViewMode>('preview');
    const [mobileView, setMobileView] = useState<MobileView>('chat');

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    useEffect(() => {
        if (generatedFiles && generatedFiles['src/app/page.tsx']) {
            try {
                const pageTsx = generatedFiles['src/app/page.tsx'];
                const bodyContent = pageTsx
                    .substring(pageTsx.indexOf('return') + 6)
                    .replace(/<main[^>]*>/, '<div class="flex min-h-screen flex-col items-center justify-center p-24">')
                    .replace(/<\/main>/, '</div>')
                    .replace(/className=/g, 'class=')
                    .replace(/<Image[^>]*\/>/g, '<div class="w-64 h-48 bg-muted rounded-lg flex items-center justify-center">Image Placeholder</div>')
                    .replace(/<[A-Z][^>]*\/>/g, (match) => `<div class="p-2 border rounded-md bg-muted/50">${match}</div>`)
                    .replace(/\{/g, '')
                    .replace(/\}/g, '');
                
                const globalsCss = generatedFiles['src/app/globals.css'] || '';

                const fullHtml = `
                    <html>
                        <head>
                            <style>${globalsCss}</style>
                            <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-background text-foreground">${bodyContent}</body>
                    </html>`;
                setPreviewContent(fullHtml);

            } catch (error) {
                console.error("Error creating preview:", error);
                setPreviewContent('<p class="text-red-500">Error generating preview.</p>');
            }
        }
    }, [generatedFiles]);

    const handleSendMessage = async () => {
        if (!currentPrompt.trim()) return;

        const newHistory: AgenticRequest['history'] = [...conversation, { role: 'user', content: currentPrompt }];
        setConversation(newHistory);
        setCurrentPrompt('');
        setIsLoading(true);

        try {
            const response = await generateAgenticResponse({ history: newHistory, model });
            setConversation(response.history);
            if (response.files) {
                setGeneratedFiles(response.files);
                if (isMobile) setMobileView('output');
            }
            if (response.error) {
                toast({ variant: 'destructive', title: 'AI Agent Error', description: response.error });
            }
        } catch (error) {
            console.error('Agent failed:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
            toast({ variant: 'destructive', title: 'An error occurred', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setConversation([]);
        setCurrentPrompt('');
        setGeneratedFiles(null);
        setIsLoading(false);
        setPreviewContent('');
    };

    const handleFeatureSoon = (featureName: string) => {
        toast({
            title: `Coming Soon: ${featureName}`,
            description: "We're working hard to add this feature. Stay tuned!",
        });
    };

    const ChatMessage = ({ role, content }: { role: 'user' | 'model', content: string }) => (
        <div className={cn("flex items-start gap-3 my-4", role === 'user' ? 'justify-end' : 'justify-start')}>
            {role === 'model' && <Avatar className="w-8 h-8"><AvatarImage src="/bot-avatar.png" /><AvatarFallback>AI</AvatarFallback></Avatar>}
            <div className={cn("p-3 rounded-2xl max-w-lg", role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
            {role === 'user' && <Avatar className="w-8 h-8"><AvatarImage src="/user-avatar.png" /><AvatarFallback>U</AvatarFallback></Avatar>}
        </div>
    );

    const renderOutputView = () => (
        <Card className="shadow-lg flex flex-col h-full w-full">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Generated Application</CardTitle>
                    <CardDescription>Preview or view the code for your app.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setMobileView('chat')}>
                            <PanelLeft/>
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleFeatureSoon('Download ZIP')}><Download/></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleFeatureSoon('Deploy')}><Github/></Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                {!generatedFiles ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                        <p>Your generated application preview and code will appear here once you provide a description and click "Generate".</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className={cn("flex-1 overflow-auto", viewMode === 'split' ? 'grid grid-cols-2 gap-2' : '')}>
                           {(viewMode === 'preview' || viewMode === 'split') && (
                                <iframe srcDoc={previewContent} className="w-full h-full border rounded-lg bg-white" sandbox="allow-scripts" />
                           )}
                           {(viewMode === 'code' || viewMode === 'split') && (
                                <Tabs value={activeFile} onValueChange={setActiveFile} className="w-full h-full flex flex-col border rounded-lg">
                                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 shrink-0">
                                        {Object.keys(generatedFiles).map(filename => (
                                            <TabsTrigger key={filename} value={filename}>{filename.replace('src/app/', '')}</TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <TabsContent value={activeFile} className="flex-1 overflow-y-auto">
                                         <CodeBlock code={`\`\`\`tsx\n${generatedFiles[activeFile]}\n\`\`\``} />
                                    </TabsContent>
                                </Tabs>
                           )}
                        </div>
                        {!isMobile && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Button variant={viewMode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('preview')}><Eye/>Preview</Button>
                                <Button variant={viewMode === 'code' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('code')}><CodeXml/>Code</Button>
                                <Button variant={viewMode === 'split' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('split')}><Split/>Split</Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderChatView = () => (
         <Card className="shadow-lg flex flex-col h-full">
            <CardHeader className="flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle>Application Agent</CardTitle>
                        <CardDescription>Chat with the AI to build or modify your app.</CardDescription>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                     <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-[180px]">
                            <BrainCircuit className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="googleai/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                            <SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={handleReset} disabled={isLoading}>
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                 </div>
            </CardHeader>
            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {conversation.map((msg, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <ChatMessage role={msg.role} content={msg.content as string} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-start gap-3 my-4 justify-start">
                             <Avatar className="w-8 h-8"><AvatarImage src="/bot-avatar.png" /><AvatarFallback>AI</AvatarFallback></Avatar>
                            <div className="p-3 rounded-2xl bg-muted">
                                 <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </CardContent>
             <CardContent className="border-t pt-4">
                 <div className="flex items-center gap-2">
                    <Textarea
                        placeholder="e.g., Make the background dark blue, or add a title that says 'My App'."
                        value={currentPrompt}
                        onChange={(e) => setCurrentPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        className="min-h-[50px] flex-1 bg-muted"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !currentPrompt.trim()} size="icon" className="h-12 w-12 shrink-0">
                       <Send />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    if (isMobile) {
        return (
            <div className="h-full w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mobileView}
                        initial={{ opacity: 0, x: mobileView === 'chat' ? -100 : 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mobileView === 'chat' ? -100 : 100 }}
                        transition={{ duration: 0.2 }}
                        className="h-full w-full"
                    >
                        {mobileView === 'chat' ? renderChatView() : renderOutputView()}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full p-2 md:p-4" dir="ltr">
            {renderChatView()}
            {renderOutputView()}
        </div>
    );
};

export default AppCreator;
