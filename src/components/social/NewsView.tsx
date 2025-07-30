
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Newspaper, Search, Link as LinkIcon, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchNews, NewsResponse } from '@/ai/flows/news-flow';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const NewsView = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState<NewsResponse | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast({
                variant: 'destructive',
                title: 'حقل الموضوع فارغ',
                description: 'الرجاء إدخال موضوع للبحث عنه.',
            });
            return;
        }

        setIsLoading(true);
        setNews(null);

        try {
            const response = await fetchNews({ topic });
            setNews(response);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            toast({
                variant: 'destructive',
                title: 'فشل في جلب الأخبار',
                description: 'لم نتمكن من العثور على أخبار حول هذا الموضوع. حاول مرة أخرى.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
                    <Newspaper className="w-10 h-10" />
                    مركز الأخبار الذكي
                </h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    اكتشف أحدث الأخبار والمستجدات حول أي موضوع يهمك، مدعوم بالذكاء الاصطناعي.
                </p>
            </div>

            <Card className="shadow-lg sticky top-4 z-10 backdrop-blur-sm bg-background/80">
                 <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                         <Textarea
                            placeholder="ما هو الموضوع الذي يهمك اليوم؟ (مثال: أحدث تقنيات الذكاء الاصطناعي)"
                            className="w-full bg-muted min-h-[50px] sm:min-h-0 sm:h-12"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12">
                            {isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جاري البحث...
                                </>
                            ) : (
                                 <>
                                    <Search className="ml-2" />
                                    بحث
                                </>
                            )}
                        </Button>
                    </form>
                 </CardContent>
            </Card>
            
             <div className="space-y-6">
                {isLoading && <NewsSkeleton />}
                {news?.articles.map((article, index) => (
                    <Card key={index} className="animate-fade-in">
                        <CardHeader>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                <CardTitle className="text-2xl">{article.title}</CardTitle>
                            </a>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                <span className="font-bold">{article.source}</span>
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>{article.publishedAt}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{article.summary}</p>
                            <Button variant="link" asChild className="p-0 h-auto mt-2">
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    <LinkIcon className="ml-2" />
                                    اقرأ المقال كاملًا
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
             </div>
             
             {!isLoading && !news && (
                 <Alert variant="default" className="text-center p-8 border-dashed">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <AlertTitle className="font-bold">موجزك الإخباري بانتظارك</AlertTitle>
                    <AlertDescription>
                        استخدم شريط البحث أعلاه للحصول على أحدث الأخبار حول أي موضوع.
                    </AlertDescription>
                </Alert>
             )}
        </div>
    );
};


const NewsSkeleton = () => (
    <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex gap-4 pt-2">
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        ))}
    </div>
)

export default NewsView;
