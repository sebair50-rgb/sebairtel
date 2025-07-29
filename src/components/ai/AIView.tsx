
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processCode } from '@/ai/flows/code-flow';
import CodeResponse from './CodeResponse';

type AIAction = 'explain' | 'fix' | 'optimize';

const AIView = () => {
    const [code, setCode] = useState('');
    const [task, setTask] = useState<AIAction>('explain');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!code.trim()) {
            toast({
                variant: 'destructive',
                title: 'حقل الكود فارغ',
                description: 'الرجاء إدخال كود برمجي لتحليله.',
            });
            return;
        }

        setIsLoading(true);
        setAiResponse(null);

        try {
            const response = await processCode({ code, task });
            setAiResponse(response.result);
        } catch (error) {
            console.error('AI action failed:', error);
            toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: 'فشل في معالجة الطلب. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 md:p-6 pb-0">
                <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">مركز الذكاء الاصطناعي</h1>
                </div>
                 <p className="text-muted-foreground">
                    استخدم قوة الذكاء الاصطناعي لتحليل الأكواد البرمجية وفهمها وتحسينها.
                </p>
            </div>
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 <div className="max-w-4xl mx-auto">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>محلل الكود بالذكاء الاصطناعي</CardTitle>
                            <CardDescription>
                                أدخل أي كود برمجي (مثل Javascript, HTML, Python) واختر المهمة المطلوبة.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs value={task} onValueChange={(value) => setTask(value as AIAction)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="explain">شرح</TabsTrigger>
                                    <TabsTrigger value="fix">تصحيح الأخطاء</TabsTrigger>
                                    <TabsTrigger value="optimize">تحسين الأداء</TabsTrigger>
                                </TabsList>
                            </Tabs>
                             <div className="font-code">
                                <Textarea
                                    placeholder="...الصق الكود هنا"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="min-h-[200px] text-left bg-muted"
                                    dir="ltr"
                                />
                             </div>
                            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                        جاري التحليل...
                                    </>
                                ) : (
                                    'تحليل الكود'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {aiResponse && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>نتائج التحليل</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CodeResponse response={aiResponse} />
                            </CardContent>
                        </Card>
                    )}
                </div>
             </div>
        </div>
    );
};

export default AIView;
