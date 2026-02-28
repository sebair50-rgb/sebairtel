
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, ArrowRight, Tag, Clock, MapPin, Plus } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Badge } from '../ui/badge';

const MarketView = () => {
    const { marketItems } = useAppContext();

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Business Hub</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Discover job opportunities, professional services, and high-quality products within the SebairTel community.
                    </p>
                </div>
                <Button size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-5 w-5" />
                    Post Requirement
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketItems.length > 0 ? (
                    marketItems.map((item) => {
                        const timeAgo = item.timestamp ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true, locale: enUS }) : '';
                        return (
                            <Card key={item.id} className="flex flex-col h-full border-none shadow-md ring-1 ring-border/50 hover:ring-primary/20 transition-all group">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="capitalize px-3 py-1 font-bold">
                                            {item.category === 'job' ? <Briefcase className="w-3 h-3 mr-1.5" /> : <Tag className="w-3 h-3 mr-1.5" />}
                                            {item.category}
                                        </Badge>
                                        <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {timeAgo}
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </CardTitle>
                                        {item.price && (
                                            <p className="text-2xl font-black text-primary mt-1">${item.price.toLocaleString()}</p>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t flex gap-2">
                                    <Button className="flex-1 font-bold rounded-lg">Details</Button>
                                    <Button variant="outline" size="icon" className="rounded-lg"><ArrowRight className="w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card rounded-3xl border-4 border-dashed border-muted">
                        <div className="bg-primary/5 p-8 rounded-full mb-6">
                            <Briefcase className="w-16 h-16 text-primary/40" />
                        </div>
                        <h2 className="text-2xl font-bold">The Market is Quiet</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Be the first to list a professional service or job opportunity in your area.
                        </p>
                        <Button variant="outline" className="mt-8 rounded-xl px-8 border-2 font-bold">
                            Create First Listing
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketView;
