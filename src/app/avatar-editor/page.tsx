
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const customizationSteps = [
    { id: 'skin', name: 'لون البشرة' },
    { id: 'hair', name: 'الشعر' },
    { id: 'eyes', name: 'العيون' },
    { id: 'shirt', name: 'الملابس' },
];

const colorPalettes = {
    skin: ['#6a4f4b', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#f5e1da', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#e57373', '#ce93d8', '#9575cd', '#7986cb', '#64b5f6', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#d4e157'],
    hair: ['#000000', '#212121', '#424242', '#616161', '#757575', '#4e342e', '#6d4c41', '#8d6e63', '#bcaaa4', '#5d4037'],
    eyes: ['#6d4c41', '#4e342e', '#3e2723', '#29b6f6', '#03a9f4', '#0288d1', '#8bc34a', '#689f38', '#33691e', '#757575'],
    shirt: ['#212121', '#fafafa', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#03a9f4', '#009688', '#8bc3a', '#ffeb3b', '#ff9800', '#795548', '#9e9e9e', '#607d8b'],
};

const ManualAvatarEditorPage = () => {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selections, setSelections] = useState<{ [key: string]: string }>({
        skin: colorPalettes.skin[7],
        hair: colorPalettes.hair[1],
        eyes: colorPalettes.eyes[0],
        shirt: colorPalettes.shirt[0],
    });

    const activeStep = customizationSteps[currentStepIndex];
    const palette = colorPalettes[activeStep.id as keyof typeof colorPalettes];
    const currentSelection = selections[activeStep.id];
    
    const handleNext = () => {
        if (currentStepIndex < customizationSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Final step: Save or proceed
            console.log("Final selections:", selections);
            router.push('/avatar-generator'); // Go back to selection for now
        }
    };
    
    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        } else {
            router.back();
        }
    };

    const handleSelectColor = (color: string) => {
        setSelections(prev => ({ ...prev, [activeStep.id]: color }));
    };


    return (
        <div className="relative h-screen w-screen flex flex-col bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
                <Button variant="ghost" size="icon" onClick={() => router.push('/avatar-generator')} className="bg-black/20 text-white rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="relative flex-1 flex items-center justify-center">
                 <Image src="https://placehold.co/600x800/E2E8F0/334155.png?text=Avatar" data-ai-hint="avatar 3d model" layout="fill" objectFit="contain" alt="Avatar Preview" className="p-16" />
            </div>

            <Card className="absolute bottom-0 left-0 right-0 m-2 rounded-t-2xl rounded-b-xl shadow-2xl">
                 <CardContent className="p-4">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={activeStep.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-bold text-center mb-4">{activeStep.name}</h2>
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                                {palette.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleSelectColor(color)}
                                        className={cn(
                                            'w-12 h-12 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 border-2',
                                            currentSelection === color ? 'ring-2 ring-offset-2 ring-primary border-primary' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                     <div className="flex items-center justify-between mt-6">
                        <Button variant="outline" onClick={handleBack} size="lg">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            {currentStepIndex === 0 ? 'رجوع' : 'السابق'}
                        </Button>
                        <div className="flex items-center gap-2">
                             {customizationSteps.map((step, index) => (
                                <div key={step.id} className={cn("w-2 h-2 rounded-full", currentStepIndex === index ? "bg-primary" : "bg-muted")}></div>
                            ))}
                        </div>
                        <Button onClick={handleNext} size="lg">
                            {currentStepIndex === customizationSteps.length - 1 ? 'حفظ' : 'التالي'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManualAvatarEditorPage;
