"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

const NewsView = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>الأخبار</CardTitle>
                    <CardDescription>
                        هذا القسم قيد التطوير. ترقبوا التحديثات!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        <Newspaper size={48} className="mx-auto mb-4" />
                        <p className="font-semibold">سيتم عرض آخر الأخبار هنا.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewsView;
