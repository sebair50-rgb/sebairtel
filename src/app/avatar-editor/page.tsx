"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Gender = 'all' | 'male' | 'female';

const bodyTypes = {
    male: [
        { id: 'm1', name: 'Male Body 1', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Fmale_1_new.png?alt=media&token=10675276-805c-433b-8287-3475c742c3d5' },
        { id: 'm2', name: 'Male Body 2', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Fmale_2_new.png?alt=media&token=96a15250-9854-47f2-89c0-68a8537b03fd' },
        { id: 'm3', name: 'Male Body 3', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Fmale_3_new.png?alt=media&token=5952f195-23c2-4014-933e-e092178d8a76' },
        { id: 'm4', name: 'Male Body 4', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Fmale_4_new.png?alt=media&token=262144b6-7c91-443b-8219-35c9a7215b2e' },
    ],
    female: [
        { id: 'f1', name: 'Female Body 1', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Ffemale_1_new.png?alt=media&token=62a39626-4449-43c7-8c83-0498b94f061e' },
        { id: 'f2', name: 'Female Body 2', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Ffemale_2_new.png?alt=media&token=21734639-5095-46e3-a442-0f0653d955b2' },
        { id: 'f3', name: 'Female Body 3', image: 'https://firebasestorage.googleapis.com/v0/b/sebairtel.appspot.com/o/avatars_assets%2Ffemale_3_new.png?alt=media&token=c1c4e723-66f8-45a1-a486-77874a7eb845' },
    ]
}

const getAllBodyTypes = () => [...bodyTypes.male, ...bodyTypes.female];


const ManualAvatarEditorPage = () => {
    const router = useRouter();
    const [selections, setSelections] = useState<{ [key: string]: string | null }>({
        bodyType: 'm1',
    });
    const [activeGender, setActiveGender] = useState<Gender>('male');

    const selectedBody = useMemo(() => {
        return getAllBodyTypes().find(body => body.id === selections.bodyType);
    }, [selections.bodyType]);


    const handleNext = () => {
       console.log("Proceeding to next step...");
    };
    
    const handleBack = () => {
        router.back();
    };

    const handleSelectBody = (id: string) => {
        setSelections(prev => ({ ...prev, bodyType: id }));
    };

    const getVisibleBodyTypes = () => {
        switch(activeGender) {
            case 'male': return bodyTypes.male;
            case 'female': return bodyTypes.female;
            default: return getAllBodyTypes();
        }
    }


    return (
        <div className="relative h-screen w-screen flex flex-col bg-slate-200 dark:bg-slate-800 overflow-hidden" dir="rtl">
            <div className="absolute top-4 left-4 z-20">
                <Button variant="ghost" size="icon" onClick={() => router.push('/avatar-generator')} className="bg-black/20 text-white rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>
             <div className="absolute top-4 right-4 z-20">
                <Button variant="ghost" size="icon" className="bg-black/20 text-white rounded-full">
                    <ArrowRight className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="relative flex-1 flex items-center justify-center p-4">
                 {selectedBody && (
                    <Image 
                        key={selectedBody.id}
                        src={selectedBody.image} 
                        data-ai-hint="avatar 3d model" 
                        layout="fill" 
                        objectFit="contain" 
                        alt="Avatar Preview" 
                        className="p-8" 
                        unoptimized
                    />
                 )}
            </div>

            <Card className="absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl">
                 <CardContent className="p-4">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key="body-type-step"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Tabs defaultValue={activeGender} onValueChange={(val) => setActiveGender(val as Gender)} className="w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">نوع الجسم</h2>
                                    <TabsList className="grid grid-cols-3 w-auto">
                                        <TabsTrigger value="all">الكل</TabsTrigger>
                                        <TabsTrigger value="male">ذكر</TabsTrigger>
                                        <TabsTrigger value="female">أنثى</TabsTrigger>
                                    </TabsList>
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeGender}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-4 gap-3 h-40"
                                    >
                                        {getVisibleBodyTypes().map((body) => (
                                            <Card 
                                                key={body.id}
                                                onClick={() => handleSelectBody(body.id)}
                                                className={cn(
                                                    "cursor-pointer transition-all overflow-hidden",
                                                    selections.bodyType === body.id ? 'ring-2 ring-primary border-primary' : 'border-border'
                                                )}
                                            >
                                                <div className="relative w-full h-full bg-slate-100">
                                                    <Image src={body.image} layout="fill" objectFit="contain" alt={body.name} className="p-2" unoptimized/>
                                                </div>
                                            </Card>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </Tabs>
                            
                        </motion.div>
                    </AnimatePresence>
                     <div className="flex flex-col items-center justify-between mt-6 gap-4">
                        <div className="w-full">
                             <p className="text-sm text-center text-muted-foreground mb-2">التصميم</p>
                             <Progress value={25} className="w-full h-1.5" />
                        </div>
                        <Button onClick={handleNext} size="lg" className="w-full">
                            حفظ ومتابعة
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManualAvatarEditorPage;
