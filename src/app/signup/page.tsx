
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, AtSign, User } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signup, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "كلمتا المرور غير متطابقتين",
                description: "الرجاء التأكد من إدخال نفس كلمة المرور مرتين.",
            });
            return;
        }

        try {
            await signup(email, password, name);
            toast({
                title: "تم إنشاء الحساب بنجاح!",
                description: "تم توجيهك إلى التطبيق.",
            });
            router.push('/');
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "خطأ في إنشاء الحساب",
                description: error.message === 'Firebase: Error (auth/email-already-in-use).' ? 'هذا البريد الإلكتروني مستخدم بالفعل.' : error.message,
            });
        }
    };

    return (
         <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
                        <CardDescription>انضم إلينا اليوم وابدأ رحلتك!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">الاسم الكامل</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" type="text" placeholder="مثال: علي محمد" required value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" dir="ltr" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" dir="ltr" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" dir="ltr" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
                            </Button>
                        </form>
                         <div className="mt-4 text-center text-sm">
                           لديك حساب بالفعل؟{" "}
                            <Link href="/login" className="underline text-primary">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
