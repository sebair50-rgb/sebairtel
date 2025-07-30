
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Zap, CheckCircle, AlertTriangle, Info, ListChecks, MessageSquareQuote, ShieldCheck, TrendingUp, UserCheck, Link as LinkIcon, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeText, KnowledgeAnalysisOutput } from '@/ai/flows/knowledge-flow';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

interface AnalyzedContent extends KnowledgeAnalysisOutput {
    id: string;
    sourceText: string;
}

const KnowledgeView = () => {
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedContent, setAnalyzedContent] = useState<AnalyzedContent[]>([]);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textToAnalyze.trim()) {
            toast({ variant: 'destructive', title: 'حقل النص فارغ', description: 'الرجاء لصق نص لتحليله.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await analyzeText({ text: textToAnalyze });
            const newContent: AnalyzedContent = {
                ...response,
                id: new Date().toISOString(),
                sourceText: textToAnalyze,
            };
            setAnalyzedContent(prev => [newContent, ...prev]);
            setTextToAnalyze('');

        } catch (error) {
            console.error('Text analysis failed:', error);
            toast({
                variant: 'destructive',
                title: 'فشل تحليل النص',
                description: 'لم نتمكن من تحليل النص. يرجى المحاولة مرة أخرى بنص مختلف.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
                    <BrainCircuit className="w-10 h-10" />
                    مساعد المعرفة الذكي
                </h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    ألصق أي نص - مقال، فكرة، سؤال - ودع الذكاء الاصطناعي يقدم لك تحليلًا معمقًا وملخصًا ذكيًا.
                </p>
            </div>

            <Card className="shadow-lg sticky top-0 z-10">
                 <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
                         <Textarea
                            placeholder="الصق النص هنا لتحليله..."
                            className="w-full bg-muted min-h-[150px] text-base"
                            value={textToAnalyze}
                            onChange={(e) => setTextToAnalyze(e.target.value)}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12 mt-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جاري التحليل...
                                </>
                            ) : (
                                 <>
                                    <Zap className="ml-2" />
                                    تحليل النص
                                </>
                            )}
                        </Button>
                    </form>
                 </CardContent>
            </Card>
            
            <div className="space-y-6">
                {analyzedContent.map((content) => (
                    <Card key={content.id} className="animate-fade-in overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-2xl">{content.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-2"><MessageSquareQuote /> الملخص</h3>
                                <p className="text-muted-foreground bg-slate-100 p-3 rounded-md">{content.summary}</p>
                            </div>
                             <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-2"><ListChecks /> النقاط الرئيسية</h3>
                                <ul className="space-y-2 list-disc pr-5">
                                    {content.keyPoints.map((point, index) => (
                                        <li key={index} className="text-muted-foreground">{point}</li>
                                    ))}
                                </ul>
                            </div>
                             <Separator />
                             <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-2"><BrainCircuit /> تحليل معمق</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{content.analysis}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
             
             {analyzedContent.length === 0 && !isLoading && (
                 <Alert variant="default" className="text-center p-8 border-dashed">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <AlertTitle className="font-bold">ابدأ رحلتك المعرفية</AlertTitle>
                    <AlertDescription>
                        ستظهر التحليلات التي يقوم بها المساعد الذكي هنا. جرب لصق نص في الحقل أعلاه!
                    </AlertDescription>
                </Alert>
             )}
        </div>
    );
};

export default KnowledgeView;
