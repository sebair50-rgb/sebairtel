"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { smartReplySuggestions, SmartReplyInput } from '@/ai/flows/smart-reply';

const AIView = () => {
    const [inputText, setInputText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateReplies = async () => {
        if (!inputText.trim()) {
            toast({ variant: 'destructive', description: 'الرجاء إدخال نص لإنشاء ردود.' });
            return;
        }
        setIsLoading(true);
        setSuggestions([]);
        try {
            const input: SmartReplyInput = { message: inputText };
            const result = await smartReplySuggestions(input);
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error('Failed to generate smart replies:', error);
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في إنشاء الردود الذكية.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <Brain className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">مركز الذكاء الاصطناعي</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                استكشف إمكانيات الذكاء الاصطناعي للمساعدة في مهامك اليومية. ابدأ بتجربة مُولِّد الردود الذكية.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare />
                        مولّد الردود الذكية
                    </CardTitle>
                    <CardDescription>
                        أدخل رسالة وسيقوم الذكاء الاصطناعي بإنشاء ردود مناسبة يمكنك استخدامها.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="اكتب هنا الرسالة التي تريد الرد عليها..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={4}
                    />
                    <Button onClick={handleGenerateReplies} disabled={isLoading}>
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                        ) : (
                            'إنشاء ردود'
                        )}
                    </Button>
                    
                    {suggestions.length > 0 && (
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2">الردود المقترحة:</h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((reply, index) => (
                                    <Button 
                                        key={index} 
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(reply).then(() => toast({ description: 'تم نسخ الرد!' }))}
                                    >
                                        {reply}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AIView;
