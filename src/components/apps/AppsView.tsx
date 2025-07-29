"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppWindow } from 'lucide-react';

const AppsView = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <AppWindow className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">التطبيقات</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                استكشف وادمج تطبيقات مختلفة لتعزيز إنتاجيتك وتوسيع إمكانياتك.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>قريباً</CardTitle>
                    <CardDescription>
                        نحن نعمل على إضافة مجموعة من التطبيقات المفيدة. ترقبوا التحديثات!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        سيتم عرض التطبيقات المتاحة هنا.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppsView;
