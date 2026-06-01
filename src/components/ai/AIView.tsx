
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Image as ImageIcon, Sparkles, Code, Video, Mic, BookOpen, Bot } from 'lucide-react';
import AppHeader from '../layout/AppHeader';
import { useRouter } from 'next/navigation';

type AITool = 'code' | 'image' | 'sticker' | 'tts' | 'video' | 'tutor' | 'app';

interface ToolConfig {
    id: AITool;
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
}

const AIToolCard = ({ icon, title, description, onSelect }: { icon: React.ElementType, title: string, description: string, onSelect: () => void }) => {
    const Icon = icon;

    return (
        <Card 
            onClick={onSelect} 
            className="h-full transition-all duration-300 cursor-pointer hover:border-primary"
        >
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
    const router = useRouter();

    const tools: { [key: string]: ToolConfig[] } = {
        media: [
            { id: 'image', icon: ImageIcon, title: 'Image Generator', description: 'Turn your ideas into unique images.', href: '/ai-tools/image-generator' },
            { id: 'sticker', icon: Sparkles, title: 'Sticker Maker', description: 'Create creative stickers for chats.', href: '/ai-tools/sticker-maker' },
            { id: 'video', icon: Video, title: 'Video Generator', description: 'Create short video clips from text.', href: '/ai-tools/video-generator' },
            { id: 'tts', icon: Mic, title: 'Text to Speech', description: 'Convert text into natural-sounding audio.', href: '/ai-tools/tts' },
        ],
        dev: [
            { id: 'app', icon: Bot, title: 'App Creator', description: 'Build an entire app from a prompt.', href: '/ai-tools/app-creator' },
            { id: 'code', icon: Code, title: 'Code Assistant', description: 'Explain, fix, and optimize code.', href: '/ai-tools/code-assistant' },
        ],
        content: [
            { id: 'tutor', icon: BookOpen, title: 'AI Tutor', description: 'Ask questions and learn new topics.', href: '/ai-tools/tutor' },
        ]
    };

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
                                    onSelect={() => router.push(tool.href)}
                                />
                            ))}
                        </ToolSection>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default AIView;
