
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const newsItems = [
    {
        id: 1,
        title: 'New technology promises a revolution in the world of AI',
        category: 'Technology',
        time: '2 hours ago',
        image: 'https://placehold.co/600x400/5e81ac/ffffff.png',
        'data-ai-hint': 'artificial intelligence',
        description: 'A team of researchers has unveiled a new AI model that can learn from smaller amounts of data, opening new horizons for applications in various fields.',
        link: '#'
    },
    {
        id: 2,
        title: 'Financial markets experience volatility after new economic decisions',
        category: 'Economy',
        time: '5 hours ago',
        image: 'https://placehold.co/600x400/a3be8c/ffffff.png',
        'data-ai-hint': 'financial markets',
        description: 'Global stock markets reacted mixedly to the recently announced economic measures, amid a state of uncertainty among investors.',
        link: '#'
    },
    {
        id: 3,
        title: 'Discovery of a new planet that could be habitable',
        category: 'Science & Space',
        time: '1 day ago',
        image: 'https://placehold.co/600x400/b48ead/ffffff.png',
        'data-ai-hint': 'exoplanet space',
        description: 'Astronomers have announced the discovery of an exoplanet located in the habitable zone, increasing the likelihood of liquid water on its surface.',
        link: '#'
    },
    {
        id: 4,
        title: 'Thrilling sports final holds breaths and ends with an unexpected result',
        category: 'Sports',
        time: '3 days ago',
        image: 'https://placehold.co/600x400/ebcb8b/000000.png',
        'data-ai-hint': 'sports stadium',
        description: 'In a marathon match, the visiting team managed to achieve a dramatic victory in the final minutes, winning the title for the first time in its history.',
        link: '#'
    }
];


const NewsView = () => {
    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Latest News</h1>
            </div>
             <p className="text-muted-foreground mb-8">
                Follow the latest developments and events from trusted sources around the world.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.map((item) => (
                    <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                         <div className="relative aspect-video">
                            <Image 
                                src={item.image} 
                                alt={item.title} 
                                layout="fill" 
                                objectFit="cover" 
                                data-ai-hint={item['data-ai-hint']}
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span className="font-semibold text-primary">{item.category}</span>
                                <span>&middot;</span>
                                <span>{item.time}</span>
                            </div>
                            <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <CardDescription>{item.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default NewsView;
