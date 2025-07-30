
"use client";

import React, { useState, useTransition, useRef } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
    const { currentUser, updateUserProfile } = useAppContext();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [name, setName] = useState(currentUser?.name || '');
    const [isPending, startTransition] = useTransition();

    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        const hasNameChanged = name.trim() !== currentUser.name;

        if (!hasNameChanged) {
            toast({ description: "لا توجد تغييرات لحفظها." });
            return;
        }

        if (!name.trim()) {
             toast({
                variant: "destructive",
                title: "الاسم مطلوب",
                description: "لا يمكن ترك حقل الاسم فارغًا.",
            });
            return;
        }

        startTransition(async () => {
            try {
                await updateUserProfile({ name });
                
                toast({
                    title: "تم بنجاح!",
                    description: "تم تحديث معلومات ملفك الشخصي بنجاح.",
                });
            } catch (error) {
                console.error("Failed to update profile:", error);
                toast({
                    variant: "destructive",
                    title: "حدث خطأ",
                    description: "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.",
                });
            }
        });
    };
    
    const handleAvatarClick = () => {
        toast({
            title: "الميزة قيد التطوير",
            description: "تتطلب ميزة رفع الصور إعداد خدمة التخزين (Storage)، وهو ما لا يمكن إتمامه حاليًا. سيتم تفعيلها قريبًا!",
        });
    }

    if (!currentUser) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader2 className="animate-spin" />
                        <span>...جاري تحميل بيانات المستخدم</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const hasChanges = (name.trim() !== currentUser.name && name.trim() !== '');

    return (
        <Card>
            <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
                <CardDescription>هذه هي معلومات ملفك الشخصي العامة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24 text-4xl">
                            <AvatarImage src={currentUser?.avatar || undefined} alt={name} />
                            <AvatarFallback>{name.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 border-2 border-card" onClick={handleAvatarClick}>
                            <Camera className="w-4 h-4"/>
                            <span className="sr-only">تغيير الصورة</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges}>
                        {isPending && <Loader2 className="ml-2 animate-spin" />}
                        {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
