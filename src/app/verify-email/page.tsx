
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useAuth } from '@/store/AuthContext';
import React from 'react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
    const { resendVerificationEmail, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const handleResendEmail = async () => {
        try {
            await resendVerificationEmail();
            toast({
                title: "Link Sent",
                description: `A new verification link has been sent to ${email}.`,
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "An error occurred",
                description: "Failed to send email. You may have requested a link too many times. Please try again later.",
            });
        }
    }

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
                        <CardTitle className="mt-4 text-2xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We have sent an activation link to <br />
                            <span className="font-bold text-primary">{email || 'your email'}</span>.
                            <br />
                            Please click the link to activate your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            If you don't find the email, please check your spam folder.
                        </p>
                        <Button onClick={handleResendEmail} disabled={loading} variant="secondary" className="w-full">
                            {loading ? <Loader2 className="animate-spin" /> : "Resend Verification Link"}
                        </Button>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="outline" onClick={() => router.push('/login')}>
                            Back to Sign In
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
