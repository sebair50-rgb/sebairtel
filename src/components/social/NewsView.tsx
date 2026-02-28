
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/store/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

const NewsView = () => {
    const { news } = useAppContext();

    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <Newspaper className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Community News</h1>
                        <p className="text-muted-foreground">Follow the latest developments from your trusted network.</p>
                    </div>
                </div>
            </div>

            {news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((item) => {
                        const timeAgo = item.timestamp ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true, locale: enUS }) : '';
                        return (
                            <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg border-none ring-1 ring-border/50 hover:ring-primary/30 transition-all group">
                                 <div className="relative aspect-video overflow-hidden">
                                    <Image 
                                        src={item.image} 
                                        alt={item.title} 
                                        layout="fill" 
                                        objectFit="cover" 
                                        className="group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <span className="font-bold text-primary/80">{item.author || 'SebairTel News'}</span>
                                        <span>&middot;</span>
                                        <span>{timeAgo}</span>
                                    </div>
                                    <CardTitle className="text-xl leading-tight font-bold group-hover:text-primary transition-colors line-clamp-2">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <CardDescription className="text-sm line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter className="pt-4 border-t bg-muted/5">
                                    <Button variant="ghost" className="w-full justify-between hover:bg-primary/10 hover:text-primary font-bold" asChild>
                                        <a href={item.link || '#'} target={item.link ? "_blank" : undefined}>
                                            Read Full Article
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-2xl border-2 border-dashed">
                    <div className="bg-muted p-6 rounded-full mb-4">
                        <Newspaper className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold">No News Yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        Stay tuned! Once news articles are published by the community or administrators, they will appear here in real-time.
                    </p>
                </div>
            )}
        </div>
    );
};

export default NewsView;
