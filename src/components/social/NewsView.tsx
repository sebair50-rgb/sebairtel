
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Zap, CheckCircle, AlertTriangle, Info, ListChecks, MessageSquareQuote, ShieldCheck, TrendingUp, UserCheck, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeNewsArticle, NewsAnalysisOutput } from '@/ai/flows/news-flow';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

interface AnalyzedArticle extends NewsAnalysisOutput {
    id: string;
    sourceText: string;
}

const NewsView = () => {
    const [articleText, setArticleText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedArticles, setAnalyzedArticles] = useState<AnalyzedArticle[]>([]);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!articleText.trim()) {
            toast({ variant: 'destructive', title: 'حقل النص فارغ', description: 'الرجاء لصق نص مقال لتحليله.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await analyzeNewsArticle({ articleText });
            const newArticle: AnalyzedArticle = {
                ...response,
                id: new Date().toISOString(),
                sourceText: articleText,
            };
            setAnalyzedArticles(prev => [newArticle, ...prev]);
            setArticleText('');

        } catch (error) {
            console.error('Article analysis failed:', error);
            toast({
                variant: 'destructive',
                title: 'فشل تحليل المقال',
                description: 'لم نتمكن من تحليل النص. يرجى المحاولة مرة أخرى بنص مختلف.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const SentimentBadge = ({ sentiment }: { sentiment: NewsAnalysisOutput['sentiment'] }) => {
        const sentimentMap = {
            Positive: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'إيجابي' },
            Negative: { icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200', label: 'سلبي' },
            Neutral: { icon: Info, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'محايد' },
        };
        const { icon: Icon, color, label } = sentimentMap[sentiment];
        return (
            <Badge variant="outline" className={`gap-1.5 ${color}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
            </Badge>
        )
    };

    const mockTrendingTopics = ["الذكاء الاصطناعي", "الاقتصاد العالمي", "التكنولوجيا", "الاستدامة", "الرعاية الصحية"];
    const mockPersonalizedNews = [
        { id: 1, title: "مستقبل تطوير الويب باستخدام أدوات الذكاء الاصطناعي", category: "Technology", image: "https://placehold.co/600x400/7C3AED/FFFFFF.png?text=AI", dataAiHint: "artificial intelligence" },
        { id: 2, title: "الأسواق المالية تتفاعل مع التغييرات الاقتصادية الجديدة", category: "Business", image: "https://placehold.co/600x400/F97316/FFFFFF.png?text=Business", dataAiHint: "finance business" },
        { id: 3, title: "ابتكارات في مجال الطاقة المتجددة تغير خريطة العالم", category: "Science", image: "https://placehold.co/600x400/10B981/FFFFFF.png?text=Science", dataAiHint: "renewable energy" },
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">موجز الأخبار الذكي</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    حوّل أي مقال إلى ملخص سهل وسريع. الصق نص المقال أدناه ودع الذكاء الاصطناعي يقوم بالباقي.
                </p>
            </div>

            <Card className="shadow-lg">
                 <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
                         <Textarea
                            placeholder="الصق نص المقال هنا لتحليله..."
                            className="w-full bg-muted min-h-[150px] text-base"
                            value={articleText}
                            onChange={(e) => setArticleText(e.target.value)}
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
                {analyzedArticles.map((article) => (
                    <Card key={article.id} className="animate-fade-in overflow-hidden">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <Badge className="mb-2">{article.category}</Badge>
                                    <CardTitle className="text-2xl">{article.title}</CardTitle>
                                </div>
                                <SentimentBadge sentiment={article.sentiment} />
                            </div>
                            <CardDescription>
                                مقال تم تحليله بناءً على النص الذي أدخلته.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-2"><MessageSquareQuote /> الملخص</h3>
                                <p className="text-muted-foreground bg-slate-100 p-3 rounded-md">{article.summary}</p>
                            </div>
                             <div>
                                <h3 className="flex items-center gap-2 font-semibold mb-2"><ListChecks /> النقاط الرئيسية</h3>
                                <ul className="space-y-2 list-disc pr-5">
                                    {article.keyPoints.map((point, index) => (
                                        <li key={index} className="text-muted-foreground">{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
             
             {analyzedArticles.length === 0 && !isLoading && (
                 <Alert variant="default" className="text-center p-8 border-dashed">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <AlertTitle className="font-bold">ابدأ رحلتك الإخبارية</AlertTitle>
                    <AlertDescription>
                        ستظهر المقالات التي تم تحليلها هنا. جرب لصق نص مقال في الحقل أعلاه!
                    </AlertDescription>
                </Alert>
             )}

            <Separator />

            <div className="space-y-8 mt-8">
                 {/* Personalized News Section */}
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><UserCheck /> أخبار تهمك</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {mockPersonalizedNews.map(item => (
                            <Card key={item.id} className="overflow-hidden group cursor-pointer">
                                <div className="relative aspect-video">
                                    <Image src={item.image} data-ai-hint={item.dataAiHint} alt={item.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform" />
                                </div>
                                <CardHeader>
                                    <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                                    <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                     {/* Trending Topics Section */}
                    <div>
                         <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><TrendingUp /> اتجاهات اليوم</h2>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    {mockTrendingTopics.map(topic => (
                                        <Badge key={topic} variant="outline" className="text-base p-2 cursor-pointer hover:bg-accent">{topic}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fact Check Section */}
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><ShieldCheck /> التحقق من الحقائق</h2>
                        <Card>
                            <CardHeader>
                                <CardDescription>ألصق نصًا أو ادعاءً للتحقق من صحته بواسطة الذكاء الاصطناعي.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Textarea placeholder="مثال: هل صحيح أن الأرض مسطحة؟" className="bg-muted" />
                                <Button className="w-full" onClick={() => toast({ description: "سيتم تفعيل هذه الميزة قريبًا" })}>
                                    <ShieldCheck className="ml-2" />
                                    تحقق الآن
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsView;

    