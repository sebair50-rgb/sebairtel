
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processCode } from '@/ai/flows/code-flow';
import CodeResponse from './CodeResponse';

type AIAction = 'explain' | 'fix' | 'optimize';

const CodeAnalyzer = () => {
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
        <Card className="shadow-lg animate-fade-in">
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

            {aiResponse && (
                <>
                    <CardHeader>
                        <CardTitle>نتائج التحليل</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeResponse response={aiResponse} />
                    </CardContent>
                </>
            )}
        </Card>
    );
};

export default CodeAnalyzer;
