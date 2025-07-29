
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const CallsView = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">تواصل</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                أقسام التواصل والمحادثات قيد التطوير.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>قريباً</CardTitle>
                    <CardDescription>
                       نحن نعمل على إضافة ميزات التواصل. ترقبوا التحديثات!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        سيتم عرض ميزات التواصل والمحادثات هنا.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CallsView;
