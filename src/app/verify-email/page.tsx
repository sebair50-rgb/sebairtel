
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md text-center">
                 <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="shadow-2xl">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <MailCheck className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="mt-4 text-2xl">تحقق من بريدك الإلكتروني</CardTitle>
                        <CardDescription>
                            لقد أرسلنا رابط تفعيل إلى <br />
                            <span className="font-bold text-primary">{email || 'بريدك الإلكتروني'}</span>.
                            <br />
                            الرجاء الضغط على الرابط لتفعيل حسابك.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            إذا لم تجد البريد، الرجاء التحقق من مجلد الرسائل غير المرغوب فيها (Spam).
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => router.push('/login')}>
                            العودة إلى صفحة تسجيل الدخول
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
