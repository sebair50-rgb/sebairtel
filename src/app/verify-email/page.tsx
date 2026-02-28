
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2, RefreshCw, LogOut } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useAuth } from '@/store/AuthContext';
import React, { useState, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';

function VerifyEmailContent() {
    const { resendVerificationEmail, loading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [isResending, setIsResending] = useState(false);

    const handleResendEmail = async () => {
        setIsResending(true);
        try {
            await resendVerificationEmail();
            toast({
                title: "Link Sent Successfully",
                description: `A new verification link has been sent to ${email || 'your registered email'}.`,
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Security Rate Limit",
                description: "You may have requested links too frequently. Please wait a few minutes and try again.",
            });
        } finally {
            setIsResending(false);
        }
    }

    const handleBackToLogin = async () => {
        await logout();
        router.replace('/login');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black p-4">
            <div className="w-full max-w-md text-center">
                 <div className="flex justify-center mb-8">
                    <Logo className="w-16 h-16" />
                </div>
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-4 pt-10">
                        <div className="mx-auto bg-primary/10 p-6 rounded-full w-fit animate-pulse">
                            <MailCheck className="w-16 h-16 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-extrabold tracking-tight">Verify Your Email</CardTitle>
                            <CardDescription className="text-base">
                                We've sent a secure activation link to:<br />
                                <span className="font-bold text-primary block mt-1">{email || 'your registered email'}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-10">
                        <p className="text-sm text-muted-foreground leading-relaxed px-4">
                            Click the link in your inbox to complete your registration. If you don't see it, check your spam or promotions folder.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={handleResendEmail} disabled={loading || isResending} variant="secondary" className="w-full h-12 rounded-xl font-bold">
                                {isResending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Resend Link
                            </Button>
                            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full text-xs underline font-medium text-muted-foreground">
                                Already verified? Click here to refresh
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 p-6 border-t">
                        <Button variant="outline" onClick={handleBackToLogin} className="w-full h-12 rounded-xl border-2 hover:bg-white dark:hover:bg-black font-bold">
                            <LogOut className="mr-2 h-4 w-4" />
                            Return to Sign In
                        </Button>
                    </CardFooter>
                </Card>
                <p className="mt-8 text-xs text-muted-foreground font-medium">
                    Secure verification provided by SebairTel Identity Systems.
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
