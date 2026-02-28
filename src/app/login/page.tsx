
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
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const cred = await login(email, password);
            if (!cred.user.emailVerified) {
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            let description = "Incorrect email or password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                description = 'The credentials provided do not match our records.';
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: description,
            });
        } finally {
            setIsLoading(false);
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
                        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                        <CardDescription>Sign in to continue to SebairTel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                 <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>
                         <div className="mt-4 text-center text-sm">
                            Don't have an account?{" "}
                            <Link href="/signup" className="underline font-bold text-primary">
                                Create a new account
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
