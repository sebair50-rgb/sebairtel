
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const newsItems = [
    {
        id: 1,
        title: 'تقنية جديدة تعد بثورة في عالم الذكاء الاصطناعي',
        category: 'تكنولوجيا',
        time: 'منذ ساعتين',
        image: 'https://placehold.co/600x400/5e81ac/ffffff.png',
        'data-ai-hint': 'artificial intelligence',
        description: 'كشف فريق من الباحثين عن نموذج جديد للذكاء الاصطناعي يمكنه التعلم من كميات أقل من البيانات، مما يفتح آفاقًا جديدة للتطبيقات في مختلف المجالات.',
        link: '#'
    },
    {
        id: 2,
        title: 'الأسواق المالية تشهد تقلبات بعد قرارات اقتصادية جديدة',
        category: 'اقتصاد',
        time: 'منذ 5 ساعات',
        image: 'https://placehold.co/600x400/a3be8c/ffffff.png',
        'data-ai-hint': 'financial markets',
        description: 'تفاعلت أسواق الأسهم العالمية بشكل متباين مع حزمة الإجراءات الاقتصادية التي تم الإعلان عنها مؤخرًا، وسط حالة من عدم اليقين بين المستثمرين.',
        link: '#'
    },
    {
        id: 3,
        title: 'اكتشاف كوكب جديد قد يكون صالحًا للحياة',
        category: 'علوم وفضاء',
        time: 'منذ يوم واحد',
        image: 'https://placehold.co/600x400/b48ead/ffffff.png',
        'data-ai-hint': 'exoplanet space',
        description: 'أعلن علماء الفلك عن اكتشاف كوكب خارج المجموعة الشمسية يقع في النطاق الصالح للحياة، مما يزيد من احتمالية وجود مياه سائلة على سطحه.',
        link: '#'
    },
    {
        id: 4,
        title: 'نهائي رياضي مثير يحبس الأنفاس وينتهي بنتيجة غير متوقعة',
        category: 'رياضة',
        time: 'منذ 3 أيام',
        image: 'https://placehold.co/600x400/ebcb8b/000000.png',
        'data-ai-hint': 'sports stadium',
        description: 'في مباراة ماراثونية، تمكن الفريق الضيف من تحقيق فوز دراماتيكي في الدقائق الأخيرة من عمر المباراة، ليتوج باللقب للمرة الأولى في تاريخه.',
        link: '#'
    }
];


const NewsView = () => {
    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">آخر الأخبار</h1>
            </div>
             <p className="text-muted-foreground mb-8">
                تابع آخر التطورات والأحداث من مصادر موثوقة حول العالم.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.map((item) => (
                    <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                         <div className="relative aspect-video">
                            <Image 
                                src={item.image} 
                                alt={item.title} 
                                layout="fill" 
                                objectFit="cover" 
                                data-ai-hint={item['data-ai-hint']}
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span className="font-semibold text-primary">{item.category}</span>
                                <span>&middot;</span>
                                <span>{item.time}</span>
                            </div>
                            <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <CardDescription>{item.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                قراءة المزيد
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default NewsView;
