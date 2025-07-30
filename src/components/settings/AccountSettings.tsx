
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
    const { updateUserEmail, authUser } = useAuth();
    const { toast } = useToast();

    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = async () => {
        if (!newEmail || newEmail === authUser?.email) {
            toast({ variant: 'destructive', title: 'الرجاء إدخال بريد إلكتروني جديد ومختلف.' });
            return;
        }
        setIsLoading(true);
        try {
            await updateUserEmail(newEmail);
            toast({
                title: 'تم إرسال رابط التحقق',
                description: `الرجاء التحقق من بريدك الإلكتروني الجديد ${newEmail} لتأكيد التغيير.`,
            });
            setNewEmail('');
        } catch (error: any) {
            console.error(error);
            let description = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
            if (error.code === 'auth/requires-recent-login') {
                description = 'هذه العملية حساسة وتتطلب إعادة تسجيل الدخول. الرجاء تسجيل الخروج ثم الدخول مرة أخرى والمحاولة مجددًا.';
            } else if (error.code === 'auth/email-already-in-use') {
                description = 'هذا البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'صيغة البريد الإلكتروني غير صحيحة.';
            }
            toast({
                variant: 'destructive',
                title: 'فشل تحديث البريد الإلكتروني',
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>الحساب والأمان</CardTitle>
                <CardDescription>إدارة إعدادات حسابك وتأمينه.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                     <h3 className="font-semibold text-lg">تغيير البريد الإلكتروني</h3>
                     <div className="space-y-2">
                        <Label htmlFor="current-email">البريد الإلكتروني الحالي</Label>
                        <Input id="current-email" type="email" disabled value={authUser?.email || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-email">البريد الإلكتروني الجديد</Label>
                        <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="أدخل بريدك الجديد" />
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleEmailChange} disabled={isLoading}>
                             {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            إرسال رابط التحقق
                        </Button>
                    </div>
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
                        <Button>تحديث كلمة المرور</Button>
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
                        <Button variant="destructive" className="mt-2 md:mt-0">حذف حسابي</Button>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountSettings;
