
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, TrendingUp, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchNews, NewsResponse } from '@/ai/flows/news-flow';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

type Article = NewsResponse['articles'][0];

const NewsView = () => {
    const [topic, setTopic] = useState('أحدث الأخبار التقنية');
    const [isLoading, setIsLoading] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const { toast } = useToast();

    const getNews = useCallback(async (currentTopic: string) => {
        if (!currentTopic.trim()) {
            toast({ variant: 'destructive', title: 'حقل الموضوع فارغ' });
            return;
        }
        setIsLoading(true);
        setArticles([]);
        try {
            const response = await fetchNews({ topic: currentTopic });
            // Sort articles by date, newest first
            const sortedArticles = response.articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            setArticles(sortedArticles);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            toast({
                variant: 'destructive',
                title: 'فشل جلب الأخبار',
                description: 'لم نتمكن من جلب الأخبار. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    // Fetch initial news on component mount
    useEffect(() => {
        getNews(topic);
    }, [getNews]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        getNews(topic);
    }

    const ArticleCard = ({ article }: { article: Article }) => (
        <Card className="hover:border-primary transition-all duration-300 animate-fade-in">
            <CardHeader>
                <Link href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                </Link>
                <CardDescription className="flex items-center gap-4 pt-2">
                    <span>{article.source}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: ar })}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{article.summary}</p>
            </CardContent>
        </Card>
    );

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

            <Card className="shadow-lg sticky top-0 z-10">
                 <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                         <div className="relative w-full">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                             <Input
                                placeholder="ابحث عن موضوع معين..."
                                className="w-full bg-muted h-12 pr-12 text-base"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                         </div>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12">
                            {isLoading ? (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                                'بحث'
                            )}
                        </Button>
                    </form>
                 </CardContent>
            </Card>
            
            <div className="space-y-6">
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                             <Card key={i}><CardHeader><CardTitle className="h-6 w-3/4 bg-muted animate-pulse rounded-md"></CardTitle><CardDescription className="h-4 w-1/4 bg-muted animate-pulse rounded-md mt-2"></CardDescription></CardHeader><CardContent className="space-y-2"><div className="h-4 w-full bg-muted animate-pulse rounded-md"></div><div className="h-4 w-5/6 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
                        ))}
                    </div>
                )}
                {!isLoading && articles.map((article) => (
                    <ArticleCard key={article.url} article={article} />
                ))}
            </div>
             
             {!isLoading && articles.length === 0 && (
                 <Alert variant="default" className="text-center p-8 border-dashed">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <AlertTitle className="font-bold">لا توجد أخبار حاليًا</AlertTitle>
                    <AlertDescription>
                        حاول البحث عن موضوع آخر أو تحقق مرة أخرى لاحقًا.
                    </AlertDescription>
                </Alert>
             )}
        </div>
    );
};

export default NewsView;
