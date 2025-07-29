
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

const AIView = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <Brain className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">مركز الذكاء الاصطناعي</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                استكشف إمكانيات الذكاء الاصطناعي للمساعدة في مهامك اليومية.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>قريباً</CardTitle>
                    <CardDescription>
                       نحن نعمل على إضافة المزيد من ميزات الذكاء الاصطناعي. ترقبوا التحديثات!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        سيتم عرض أدوات الذكاء الاصطناعي هنا.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AIView;
