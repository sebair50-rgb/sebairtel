
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

const NewsView = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
                    <Newspaper className="w-10 h-10" />
                    مركز الأخبار
                </h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    اكتشف أحدث الأخبار والمستجدات حول أي موضوع يهمك.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قريباً</CardTitle>
                    <CardDescription>
                        نحن نعمل على تطوير هذه الميزة. ترقبوا التحديثات!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        سيتم عرض موجز الأخبار هنا.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewsView;
