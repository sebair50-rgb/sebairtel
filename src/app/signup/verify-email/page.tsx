
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import { MailCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const checkVerificationStatus = useCallback(async () => {
    setIsChecking(true);
    if (auth.currentUser) {
      // Reload the user object to get the latest email verification status
      await auth.currentUser.reload();
      const freshUser = auth.currentUser;

      if (freshUser && freshUser.emailVerified) {
        toast({ title: "تم تأكيد البريد الإلكتروني بنجاح!", description: "لنكمل إعداد ملفك الشخصي." });
        router.push('/signup/complete-profile');
      } else {
        toast({ variant: "destructive", title: "لم يتم التحقق بعد", description: "الرجاء التحقق من صندوق بريدك والنقر على رابط التفعيل." });
      }
    }
    setIsChecking(false);
  }, [router, toast]);

  useEffect(() => {
    if (!loading && !user) {
        // If user is somehow logged out, send back to login
        router.replace('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
            <div className="flex justify-center mb-4">
                <MailCheck className="w-16 h-16 text-primary" />
            </div>
          <CardTitle className="text-2xl">تأكيد بريدك الإلكتروني (الخطوة 2 من 3)</CardTitle>
          <CardDescription>
            لقد أرسلنا رابط تحقق إلى <span className="font-bold text-foreground">{user?.email}</span>.
            الرجاء النقر على الرابط في البريد الإلكتروني لتفعيل حسابك.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                إذا لم تجد البريد، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam).
            </p>
            <Button onClick={checkVerificationStatus} className="w-full" disabled={isChecking}>
                {isChecking ? <Loader2 className="animate-spin ml-2" /> : null}
                لقد قمت بالتحقق، متابعة
            </Button>
        </CardContent>
         <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => router.push('/login')}>العودة لتسجيل الدخول</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

