
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark, FileDigit, ShoppingCart, Car, Mail, Globe, Terminal, AppWindow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AppHeader from '../layout/AppHeader';

const appCategories = [
    {
        title: "المعاملات المالية",
        apps: [
            {
                icon: Landmark,
                title: "الخدمات البنكية",
                description: "إدارة حساباتك",
                color: "bg-blue-100 dark:bg-blue-900/50",
                textColor: "text-blue-600 dark:text-blue-300",
                action: () => {}
            },
            {
                icon: FileDigit,
                title: "الفواتير",
                description: "دفع فواتيرك بسهولة",
                color: "bg-green-100 dark:bg-green-900/50",
                textColor: "text-green-600 dark:text-green-300",
                action: () => {}
            }
        ]
    },
    {
        title: "الخدمات اليومية",
        apps: [
             {
                icon: ShoppingCart,
                title: "الطلبات",
                description: "توصيل طعام وبقالة",
                color: "bg-orange-100 dark:bg-orange-900/50",
                textColor: "text-orange-600 dark:text-orange-300",
                action: () => {}
            },
            {
                icon: Car,
                title: "المواصلات",
                description: "اطلب سيارة أجرة",
                color: "bg-slate-200 dark:bg-slate-700",
                textColor: "text-slate-700 dark:text-slate-300",
                action: () => {}
            },
            {
                icon: Mail,
                title: "البريد",
                description: "خدمات بريدية سريعة",
                color: "bg-red-100 dark:bg-red-900/50",
                textColor: "text-red-600 dark:text-red-300",
                action: () => {}
            },
        ]
    },
     {
        title: "تطبيقات SebairTel",
        apps: [
            {
                icon: Globe,
                title: "المترجم",
                description: "ترجمة فورية",
                color: "bg-teal-100 dark:bg-teal-900/50",
                textColor: "text-teal-600 dark:text-teal-300",
                action: () => {}
            },
            {
                icon: Terminal,
                title: "محرر الكود",
                description: "أداة للمطورين",
                color: "bg-purple-100 dark:bg-purple-900/50",
                textColor: "text-purple-600 dark:text-purple-300",
                action: () => {}
            }
        ]
    }
];

const AppCard = ({ icon: Icon, title, description, color, textColor, action }: { 
    icon: React.ElementType,
    title: string,
    description: string,
    color: string,
    textColor: string,
    action: () => void,
}) => {
    const { toast } = useToast();

    const handleActionClick = () => {
        toast({
            title: `قريبا: ${title}`,
            description: "نحن نعمل بجد لإطلاق هذا التطبيق. ترقبوا التحديثات!",
        });
        action();
    };

    return (
        <motion.div
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
        >
            <Card 
                className="h-full w-full cursor-pointer overflow-hidden text-center transition-shadow hover:shadow-lg"
                onClick={handleActionClick}
            >
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                    <div className={cn("p-4 rounded-xl", color)}>
                        <Icon className={cn("w-8 h-8", textColor)} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const AppsView = () => {
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-gray-950">
            <AppHeader title="التطبيقات" icon={AppWindow} />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-10">
                     {appCategories.map((category, index) => (
                        <section key={index}>
                            <h2 className="text-xl font-bold mb-4">{category.title}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {category.apps.map((app, appIndex) => (
                                    <AppCard key={appIndex} {...app} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppsView;
