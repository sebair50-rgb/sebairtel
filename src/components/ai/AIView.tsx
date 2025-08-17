
"use client";

import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AppCreator from './AppCreator';

type AITool = 'code' | 'image' | 'sticker' | 'tts' | 'video' | 'tutor' | 'design' | 'editor' | 'app' | 'website';

interface ToolConfig {
    id: AITool;
    icon: React.ElementType;
    title: string;
    description: string;
    component: React.ElementType;
    comingSoon?: boolean;
}

const AIToolCard = ({ icon, title, description, onSelect, comingSoon = false }: { icon: React.ElementType, title: string, description: string, onSelect: () => void, comingSoon?: boolean }) => {
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
            <Card className={`h-full hover:border-primary transition-all duration-300 ${comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}>
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
    const [selectedTool, setSelectedTool] = useState<ToolConfig | null>(null);

    const tools: { [key: string]: ToolConfig[] } = {
        media: [
            { id: 'image', icon: ImageIcon, title: 'Image Generator', description: 'Turn your ideas into unique images.', component: ImageGenerator },
            { id: 'sticker', icon: Sparkles, title: 'Sticker Maker', description: 'Create creative stickers for chats.', component: StickerGenerator },
            { id: 'video', icon: Video, title: 'Video Generator', description: 'Create short video clips from text.', component: VideoGenerator },
            { id: 'tts', icon: Mic, title: 'Text to Speech', description: 'Convert text into natural-sounding audio.', component: TextToSpeech },
        ],
        dev: [
            { id: 'code', icon: Code, title: 'Code Assistant', description: 'Explain, fix, and optimize code.', component: CodeAnalyzer },
            { id: 'app', icon: Bot, title: 'App Creator', description: 'Generate app boilerplate.', component: AppCreator, comingSoon: false },
            { id: 'website', icon: LayoutTemplate, title: 'Website Builder', description: 'Build landing pages.', component: () => null, comingSoon: true },
        ],
        content: [
            { id: 'tutor', icon: BookOpen, title: 'AI Tutor', description: 'Ask questions and learn new topics.', component: AutomatedTutor },
            { id: 'design', icon: Brush, title: 'Design Ideas', description: 'Get UI/UX mockups and ideas.', component: () => null, comingSoon: true },
            { id: 'editor', icon: Video, title: 'Video Editor', description: 'AI-powered video editing assistance.', component: () => null, comingSoon: true },
        ]
    };

    const allTools = Object.values(tools).flat();
    const ActiveToolComponent = selectedTool?.component;

    return (
        <div className="w-full h-full flex flex-col">
            <AppHeader title="Creativity Center" icon={BrainCircuit} />
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 <p className="text-muted-foreground text-center max-w-4xl mx-auto mb-8">
                    Use the power of AI for creation and analysis. Choose one of the tools below to get started.
                </p>
                <div className="max-w-6xl mx-auto space-y-10">
                    {Object.entries(tools).map(([categoryKey, categoryTools]) => (
                        <ToolSection key={categoryKey} title={
                            categoryKey === 'media' ? "Media Generation" :
                            categoryKey === 'dev' ? "Development & Code" :
                            "Content & Learning"
                        }>
                            {categoryTools.map(tool => (
                                <AIToolCard
                                    key={tool.id}
                                    icon={tool.icon}
                                    title={tool.title}
                                    description={tool.description}
                                    onSelect={() => setSelectedTool(tool)}
                                    comingSoon={tool.comingSoon}
                                />
                            ))}
                        </ToolSection>
                    ))}
                </div>

                <Dialog open={!!selectedTool} onOpenChange={(isOpen) => !isOpen && setSelectedTool(null)}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                         {selectedTool && (
                            <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                    <selectedTool.icon className="w-7 h-7 text-primary"/>
                                    {selectedTool.title}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedTool.description}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="overflow-y-auto flex-1 -mr-6 pr-6">
                                {ActiveToolComponent && <ActiveToolComponent />}
                            </div>
                            </>
                         )}
                    </DialogContent>
                </Dialog>
             </div>
        </div>
    );
};

export default AIView;
