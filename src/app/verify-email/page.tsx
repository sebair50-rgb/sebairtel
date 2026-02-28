
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2, RefreshCw, LogOut } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useAuth } from '@/store/AuthContext';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
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
        router.push('/login');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black p-4">
            <div className="w-full max-w-md text-center">
                 <div className="flex justify-center mb-8">
                    <Logo className="w-16 h-16" />
                </div>
                <Card className="shadow-2xl border-none">
                    <CardHeader className="space-y-4">
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
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Click the link in your inbox to complete your registration. If you don't see it, check your spam or promotions folder.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={handleResendEmail} disabled={loading || isResending} variant="secondary" className="w-full h-12 rounded-xl font-bold">
                                {isResending ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Resend Link
                            </Button>
                            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full text-xs underline">
                                Already verified? Click here to refresh
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-t pt-6">
                        <Button variant="outline" onClick={handleBackToLogin} className="w-full h-12 rounded-xl border-2 hover:bg-slate-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            Return to Sign In
                        </Button>
                    </CardFooter>
                </Card>
                <p className="mt-8 text-xs text-muted-foreground">
                    Secure verification provided by SebairTel Identity Systems.
                </p>
            </div>
        </div>
    );
}
