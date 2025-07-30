
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Camera } from 'lucide-react';

const ProfileSettings = () => {
    const { currentUser } = useAppContext();

    if (!currentUser) {
        return <div>...جاري التحميل</div>;
    }

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
                            <AvatarFallback>{currentUser.avatar}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 border-2 border-card">
                            <Camera className="w-4 h-4"/>
                            <span className="sr-only">تغيير الصورة</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" defaultValue={currentUser.name} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button>حفظ التغييرات</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
