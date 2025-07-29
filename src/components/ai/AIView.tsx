
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Image as ImageIcon, Sparkles, Code, Loader2 } from 'lucide-react';
import CodeAnalyzer from './CodeAnalyzer';
import ImageGenerator from './ImageGenerator';
import StickerGenerator from './StickerGenerator';

type AITool = 'code' | 'image' | 'sticker';

const AIToolCard = ({ icon, title, description, onSelect, isActive }: { icon: React.ElementType, title: string, description: string, onSelect: () => void, isActive: boolean }) => {
    const Icon = icon;
    return (
        <button onClick={onSelect} className="w-full text-right">
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
        { id: 'image', icon: ImageIcon, title: 'مولد الصور', description: 'حوّل أفكارك إلى صور فنية فريدة.' },
        { id: 'sticker', icon: Sparkles, title: 'صانع الملصقات', description: 'أنشئ ملصقات إبداعية للمحادثات.' },
        { id: 'code', icon: Code, title: 'مساعد الأكواد', description: 'شرح، تصحيح، وتحسين الأكواد البرمجية.' },
    ];

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 md:p-6 pb-0">
                <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">مركز الإبداع بالذكاء الاصطناعي</h1>
                </div>
                 <p className="text-muted-foreground">
                    استخدم قوة الذكاء الاصطناعي للإبداع والتحليل. اختر إحدى الأدوات أدناه للبدء.
                </p>
            </div>
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
