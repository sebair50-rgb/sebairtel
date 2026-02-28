
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store as StoreIcon, HeartPulse, ArrowRight, MapPin, Star, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import Image from 'next/image';
import { Badge } from '../ui/badge';

const StoreView = () => {
    const { stores } = useAppContext();

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Local Services
                </div>
                <h1 className="text-4xl font-black tracking-tight lg:text-6xl">Local Marketplace</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Access verified community stores, essential pharmacies, and local service providers with immediate delivery and support.
                </p>
            </div>

            {stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stores.map((store) => (
                        <Card key={store.id} className="group overflow-hidden border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl">
                            <div className="relative h-48 overflow-hidden">
                                <Image 
                                    src={store.image} 
                                    alt={store.name} 
                                    layout="fill" 
                                    objectFit="cover"
                                    className="group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <Badge className="bg-white/90 text-black border-none font-bold backdrop-blur-md">
                                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                        4.9
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        {store.category === 'pharmacy' ? <HeartPulse className="w-4 h-4 text-primary" /> : <StoreIcon className="w-4 h-4 text-primary" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{store.category}</span>
                                </div>
                                <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">{store.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {store.description}
                                </p>
                                {store.location && (
                                    <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-muted-foreground/80">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        {store.location}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-muted/5">
                                <Button className="w-full rounded-xl h-12 font-black text-lg gap-2 shadow-inner">
                                    <ShoppingBag className="w-5 h-5" />
                                    Enter Store
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center bg-slate-100/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed">
                    <div className="relative mb-8">
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <StoreIcon className="w-24 h-24 text-primary relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black">No Stores Registered</h2>
                    <p className="text-muted-foreground mt-4 max-w-md mx-auto text-lg">
                        Our local marketplace is currently preparing for launch. Registered business owners will soon be able to showcase their services here.
                    </p>
                    <div className="flex gap-4 mt-10">
                        <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 font-bold">Contact Support</Button>
                        <Button className="rounded-2xl h-14 px-10 font-bold shadow-2xl shadow-primary/20">Become a Provider</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreView;
