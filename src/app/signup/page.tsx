
"use client";

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const newUser: User = {
        id: userCredential.user.uid,
        name: name,
        avatar: name.charAt(0) || 'م',
        email: email,
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);

      await sendEmailVerification(userCredential.user);
      
      await auth.signOut(); // Sign out the user until they verify their email

      toast({ 
        title: "تم إنشاء الحساب بنجاح", 
        description: "لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني. الرجاء تفعيل حسابك لتتمكن من تسجيل الدخول.",
        duration: 10000 // Show toast longer
      });
      router.push('/login');
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
          <CardTitle className="text-2xl">إنشاء حساب</CardTitle>
          <CardDescription>أدخل معلوماتك لإنشاء حساب جديد</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" placeholder="الاسم الكامل" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="mail@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جارِ إنشاء الحساب...' : 'إنشاء حساب'}
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
