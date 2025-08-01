
"use client";

import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Image as ImageIcon, Sparkles, Code } from 'lucide-react';
import CodeAnalyzer from './CodeAnalyzer';
import ImageGenerator from './ImageGenerator';
import StickerGenerator from './StickerGenerator';
import AppHeader from '../layout/AppHeader';

type AITool = 'code' | 'image' | 'sticker';

const AIToolCard = ({ icon, title, description, onSelect, isActive }: { icon: React.ElementType, title: string, description: string, onSelect: () => void, isActive: boolean }) => {
    const Icon = icon;
    return (
        <button onClick={onSelect} className="w-full text-left">
            <Card className={`hover:border-primary transition-all duration-300 ${isActive ? 'border-primary ring-2 ring-primary' : ''}`}>
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

const AIView = () => {
    const [activeTool, setActiveTool] = useState<AITool>('image');

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'code':
                return <CodeAnalyzer />;
            case 'image':
                return <ImageGenerator />;
            case 'sticker':
                return <StickerGenerator />;
            default:
                return <ImageGenerator />;
        }
    }

    const tools: { id: AITool, icon: React.ElementType, title: string, description: string }[] = [
        { id: 'image', icon: ImageIcon, title: 'Image Generator', description: 'Turn your ideas into unique images.' },
        { id: 'sticker', icon: Sparkles, title: 'Sticker Maker', description: 'Create creative stickers for chats.' },
        { id: 'code', icon: Code, title: 'Code Assistant', description: 'Explain, fix, and optimize code snippets.' },
    ];

    return (
        <div className="w-full h-full flex flex-col">
            <AppHeader title="Creativity Center" icon={BrainCircuit} />
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 <p className="text-muted-foreground max-w-4xl mx-auto mb-8">
                    Use the power of AI for creation and analysis. Choose one of the tools below to get started.
                </p>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {tools.map(tool => (
                        <AIToolCard
                            key={tool.id}
                            icon={tool.icon}
                            title={tool.title}
                            description={tool.description}
                            onSelect={() => setActiveTool(tool.id)}
                            isActive={activeTool === tool.id}
                        />
                    ))}
                </div>
                
                <div className="max-w-4xl mx-auto">
                    {renderActiveTool()}
                </div>
             </div>
        </div>
    );
};

export default AIView;
