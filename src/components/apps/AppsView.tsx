"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AppWindow } from 'lucide-react';
import AppHeader from '../layout/AppHeader';

const AppsView = () => {
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-gray-950">
            <AppHeader title="Apps" icon={AppWindow} />
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <h2 className="text-xl font-semibold text-foreground mb-2">No connected apps are configured</h2>
                            <p>Production app integrations will appear here after they are backed by real services.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AppsView;
