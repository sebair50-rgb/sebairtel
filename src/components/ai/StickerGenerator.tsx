
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSticker } from '@/ai/flows/sticker-flow';
import Image from 'next/image';

const StickerGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'حقل الوصف فارغ',
                description: 'الرجاء إدخال وصف للملصق الذي تريد إنشاءه.',
            });
            return;
        }

        setIsLoading(true);
        setImageUrl(null);

        try {
            const response = await generateSticker({ prompt });
            setImageUrl(response.imageUrl);
        } catch (error) {
            console.error('Sticker generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: 'فشل في توليد الملصق. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'generated-sticker.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>صانع الملصقات (Stickers)</CardTitle>
                <CardDescription>
                    حوّل أفكارك إلى ملصقات رائعة للمحادثات. سيتم إنشاء الملصق بخلفية شفافة.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="مثال: ضفدع لطيف يبرمج على لابتوب"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-muted"
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري إنشاء الملصق...
                        </>
                    ) : (
                        <>
                            <Wand2 className="ml-2 h-4 w-4" />
                            إنشاء الملصق
                        </>
                    )}
                </Button>
            </CardContent>

            {imageUrl && (
                <CardContent className="flex flex-col items-center gap-4">
                     <CardHeader className="p-0">
                        <CardTitle>الملصق جاهز!</CardTitle>
                    </CardHeader>
                    <div className="relative w-64 h-64 rounded-lg bg-slate-200 dark:bg-slate-800 p-4">
                         <Image src={imageUrl} alt={prompt} layout="fill" objectFit="contain" />
                    </div>
                     <Button variant="outline" onClick={handleDownload}>
                        <Download className="ml-2 h-4 w-4" />
                        تنزيل الملصق (PNG)
                    </Button>
                </CardContent>
            )}
        </Card>
    );
};

export default StickerGenerator;
