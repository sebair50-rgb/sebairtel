"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppWindow, Languages, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const apps = [
    {
        icon: Languages,
        title: "المترجم الفوري",
        description: "ترجم النصوص بسهولة بين لغات متعددة بدقة عالية وسياق طبيعي.",
        actionText: "ابدأ الترجمة",
        tag: "لغات"
    }
];

const AppsView = () => {
    const { toast } = useToast();

    const handleActionClick = (title: string) => {
        toast({
            title: `قريبا: ${title}`,
            description: "نحن نعمل بجد لإطلاق هذا التطبيق. ترقبوا التحديثات!",
        });
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 md:p-6 pb-4 border-b bg-background z-10 sticky top-0">
                <div className="flex items-center gap-3 mb-2">
                    <AppWindow className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">مركز التطبيقات</h1>
                </div>
                <p className="text-muted-foreground">
                    استكشف وادمج تطبيقات مختلفة لتعزيز إنتاجيتك وتوسيع إمكانياتك.
                </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apps.map((app, index) => (
                        <Card key={index} className="flex flex-col text-center items-center p-6 hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="p-0">
                                <div className="bg-primary/10 p-4 rounded-full mx-auto">
                                    <app.icon className="w-10 h-10 text-primary" />
                                </div>
                                <CardTitle className="mt-4 text-2xl">{app.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 mt-2">
                                <CardDescription>{app.description}</CardDescription>
                            </CardContent>
                            <Button 
                                className="mt-6 w-full"
                                onClick={() => handleActionClick(app.title)}
                            >
                                {app.actionText}
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppsView;
