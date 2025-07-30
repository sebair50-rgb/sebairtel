
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const AccountSettings = () => {
    const { authUser } = useAuth();
    const { toast } = useToast();

    return (
        <Card>
            <CardHeader>
                <CardTitle>الحساب والأمان</CardTitle>
                <CardDescription>إدارة إعدادات حسابك وتأمينه.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-2">
                    <Label htmlFor="current-email">البريد الإلكتروني الحالي</Label>
                    <Input id="current-email" type="email" disabled value={authUser?.email || ''} />
                </div>

                <Separator />

                <div className="space-y-4">
                     <h3 className="font-semibold text-lg">تغيير كلمة المرور</h3>
                     <div className="space-y-2">
                        <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => toast({ description: "سيتم تفعيل هذه الميزة قريبًا" })}>تحديث كلمة المرور</Button>
                    </div>
                </div>
                 <Separator />

                 <div className="space-y-4">
                     <h3 className="font-semibold text-lg text-destructive">منطقة الخطر</h3>
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                        <div>
                            <p className="font-bold">حذف الحساب</p>
                            <p className="text-sm text-muted-foreground">سيتم حذف حسابك وجميع بياناتك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        <Button variant="destructive" className="mt-2 md:mt-0" onClick={() => toast({ description: "سيتم تفعيل هذه الميزة قريبًا" })}>حذف حسابي</Button>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountSettings;
