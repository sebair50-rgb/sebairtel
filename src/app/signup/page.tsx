
"use client";

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast({ variant: "destructive", title: "كلمتا المرور غير متطابقتين", description: "الرجاء التأكد من تطابق كلمتي المرور." });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(userCredential.user);
      
      // Don't sign out, user needs to be logged in for the next steps
      // await auth.signOut(); 

      toast({ 
        title: "تم إنشاء الحساب بنجاح", 
        description: "لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني. الرجاء تفعيل حسابك.",
        duration: 10000
      });
      
      // Redirect to the verification page
      router.push('/signup/verify-email');

    } catch (error: any) {
        if(error.code === 'auth/email-already-in-use') {
             toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: "هذا البريد الإلكتروني مستخدم بالفعل." });
        } else if (error.code === 'auth/weak-password') {
            toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: "كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل." });
        }
        else {
            toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى." });
        }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
          <CardTitle className="text-2xl">إنشاء حساب (الخطوة 1 من 3)</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="mail@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جارِ الإنشاء...' : 'إنشاء ومتابعة'}
            </Button>
            <p className="mt-4 text-xs text-center text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="underline hover:text-primary">
                سجل الدخول
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
