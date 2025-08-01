
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, HeartPulse, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StoreView = () => {
    const { toast } = useToast();

    const sections = [
        {
            icon: Store,
            title: "Stores & Markets",
            description: "Browse local stores and their products, and order your needs directly.",
            actionText: "Browse Stores"
        },
        {
            icon: HeartPulse,
            title: "Pharmacies & Health Services",
            description: "Find the nearest pharmacy or available health service in your area.",
            actionText: "Search Pharmacies"
        }
    ];

    const handleActionClick = (title: string) => {
        toast({
            title: `Coming Soon: ${title}`,
            description: "We're working hard to launch this section. Stay tuned for updates!",
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Local Market & Services</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Everything you need from stores, pharmacies, and services in one place.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, index) => (
                    <Card key={index} className="flex flex-col text-center items-center p-6 hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-0">
                            <div className="bg-primary/10 p-4 rounded-full mx-auto">
                                <section.icon className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="mt-4 text-2xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 mt-2">
                            <CardDescription>{section.description}</CardDescription>
                        </CardContent>
                        <Button 
                            className="mt-6 w-full"
                            onClick={() => handleActionClick(section.title)}
                        >
                            {section.actionText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StoreView;
