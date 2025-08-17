
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Image as ImageIcon, Sparkles, Code, Video, Mic, BookOpen, Brush, LayoutTemplate, Bot } from 'lucide-react';
import CodeAnalyzer from './CodeAnalyzer';
import ImageGenerator from './ImageGenerator';
import StickerGenerator from './StickerGenerator';
import AppHeader from '../layout/AppHeader';
import { useToast } from '@/hooks/use-toast';
import TextToSpeech from './TextToSpeech';
import VideoGenerator from './VideoGenerator';
import AutomatedTutor from './AutomatedTutor';
import { AnimatePresence, motion } from 'framer-motion';

type AITool = 'code' | 'image' | 'sticker' | 'tts' | 'video' | 'tutor' | 'design' | 'editor' | 'app' | 'website';

const AIToolCard = ({ icon, title, description, onSelect, isActive, comingSoon = false }: { icon: React.ElementType, title: string, description: string, onSelect: () => void, isActive: boolean, comingSoon?: boolean }) => {
    const Icon = icon;
    const { toast } = useToast();
    
    const handleSelect = () => {
        if(comingSoon) {
            toast({
                title: 'Coming Soon!',
                description: `The "${title}" service is currently in development.`
            });
        } else {
            onSelect();
        }
    }

    return (
        <button onClick={handleSelect} className="w-full text-left" disabled={comingSoon}>
            <Card className={`h-full hover:border-primary transition-all duration-300 ${isActive ? 'border-primary ring-2 ring-primary' : ''} ${comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </button>
    )
}

const ToolSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section>
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </section>
);


const AIView = () => {
    const [activeTool, setActiveTool] = useState<AITool>('image');
    const toolRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (toolRef.current) {
            toolRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeTool]);

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'code': return <CodeAnalyzer />;
            case 'image': return <ImageGenerator />;
            case 'sticker': return <StickerGenerator />;
            case 'tts': return <TextToSpeech />;
            case 'video': return <VideoGenerator />;
            case 'tutor': return <AutomatedTutor />;
            default: return <ImageGenerator />;
        }
    }

    const tools = {
        media: [
            { id: 'image', icon: ImageIcon, title: 'Image Generator', description: 'Turn your ideas into unique images.' },
            { id: 'sticker', icon: Sparkles, title: 'Sticker Maker', description: 'Create creative stickers for chats.' },
            { id: 'video', icon: Video, title: 'Video Generator', description: 'Create short video clips from text.' },
            { id: 'tts', icon: Mic, title: 'Text to Speech', description: 'Convert text into natural-sounding audio.' },
        ],
        dev: [
            { id: 'code', icon: Code, title: 'Code Assistant', description: 'Explain, fix, and optimize code.' },
            { id: 'app', icon: Bot, title: 'App Creator', description: 'Generate app boilerplate.', comingSoon: true },
            { id: 'website', icon: LayoutTemplate, title: 'Website Builder', description: 'Build landing pages.', comingSoon: true },
        ],
        content: [
            { id: 'tutor', icon: BookOpen, title: 'AI Tutor', description: 'Ask questions and learn new topics.' },
            { id: 'design', icon: Brush, title: 'Design Ideas', description: 'Get UI/UX mockups and ideas.', comingSoon: true },
            { id: 'editor', icon: Video, title: 'Video Editor', description: 'AI-powered video editing assistance.', comingSoon: true },
        ]
    }


    return (
        <div className="w-full h-full flex flex-col">
            <AppHeader title="Creativity Center" icon={BrainCircuit} />
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 <p className="text-muted-foreground text-center max-w-4xl mx-auto mb-8">
                    Use the power of AI for creation and analysis. Choose one of the tools below to get started.
                </p>
                <div className="max-w-6xl mx-auto space-y-10">
                    <ToolSection title="Media Generation">
                         {tools.media.map(tool => (
                            <AIToolCard
                                key={tool.id}
                                icon={tool.icon}
                                title={tool.title}
                                description={tool.description}
                                onSelect={() => setActiveTool(tool.id as AITool)}
                                isActive={activeTool === tool.id}
                                comingSoon={tool.comingSoon}
                            />
                        ))}
                    </ToolSection>

                    <ToolSection title="Development & Code">
                         {tools.dev.map(tool => (
                            <AIToolCard
                                key={tool.id}
                                icon={tool.icon}
                                title={tool.title}
                                description={tool.description}
                                onSelect={() => setActiveTool(tool.id as AITool)}
                                isActive={activeTool === tool.id}
                                comingSoon={tool.comingSoon}
                            />
                        ))}
                    </ToolSection>
                    
                     <ToolSection title="Content & Learning">
                         {tools.content.map(tool => (
                            <AIToolCard
                                key={tool.id}
                                icon={tool.icon}
                                title={tool.title}
                                description={tool.description}
                                onSelect={() => setActiveTool(tool.id as AITool)}
                                isActive={activeTool === tool.id}
                                comingSoon={tool.comingSoon}
                            />
                        ))}
                    </ToolSection>
                </div>
                
                <div ref={toolRef} className="max-w-4xl mx-auto mt-12 pt-4">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTool}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderActiveTool()}
                        </motion.div>
                    </AnimatePresence>
                </div>
             </div>
        </div>
    );
};

export default AIView;
