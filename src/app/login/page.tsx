
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, AtSign } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            router.push('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "خطأ في تسجيل الدخول",
                description: error.message === 'Firebase: Error (auth/invalid-credential).' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : error.message,
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
                        <CardTitle className="text-2xl">مرحباً بعودتك!</CardTitle>
                        <CardDescription>سجل الدخول للمتابعة إلى SebairTel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                 <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
                            </Button>
                        </form>
                         <div className="mt-4 text-center text-sm">
                            ليس لديك حساب؟{" "}
                            <Link href="/signup" className="underline text-primary">
                                إنشاء حساب جديد
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
