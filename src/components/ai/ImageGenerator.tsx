
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/image-flow';
import Image from 'next/image';

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'حقل الوصف فارغ',
                description: 'الرجاء إدخال وصف للصورة التي تريد إنشاءها.',
            });
            return;
        }

        setIsLoading(true);
        setImageUrl(null);

        try {
            const response = await generateImage({ prompt });
            setImageUrl(response.imageUrl);
        } catch (error) {
            console.error('Image generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: 'فشل في توليد الصورة. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

    return (
        <Card className="shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle>مولّد الصور بالذكاء الاصطناعي</CardTitle>
                <CardDescription>
                    اكتب وصفًا نصيًا دقيقًا للصورة التي تتخيلها، وسيقوم الذكاء الاصطناعي بتحويلها إلى حقيقة.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="مثال: قط يرتدي قبعة ساحر ويقرأ كتابًا في مكتبة قديمة"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-muted"
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري توليد الصورة...
                        </>
                    ) : (
                        'إنشاء الصورة'
                    )}
                </Button>
            </CardContent>

            {imageUrl && (
                <CardContent className="flex flex-col items-center gap-4">
                    <CardHeader className="p-0">
                        <CardTitle>صورتك جاهزة!</CardTitle>
                    </CardHeader>
                    <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border">
                         <Image src={imageUrl} alt={prompt} layout="fill" objectFit="cover" />
                    </div>
                     <Button variant="outline" onClick={handleDownload}>
                        <Download className="ml-2 h-4 w-4" />
                        تنزيل الصورة
                    </Button>
                </CardContent>
            )}
        </Card>
    );
};

export default ImageGenerator;
