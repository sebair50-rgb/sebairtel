
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
    const { signup, isSigningUp } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: "Weak Password",
                description: "Password must be at least 6 characters.",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords Mismatch",
                description: "Please ensure your passwords match.",
            });
            return;
        }

        try {
            await signup(email, password, name);
            // Redirection is handled by the AuthGuard automatically
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            console.error("Signup error:", error);
            let description = "An unexpected error occurred. Please try again.";
            
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email is already registered.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'Invalid email address format.';
            }

             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: description,
            });
        }
    };

    return (
         <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="shadow-2xl border-none ring-1 ring-slate-200">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-extrabold tracking-tight">Create Account</CardTitle>
                        <CardDescription>Join SebairTel AI and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" type="text" placeholder="Ali Mohammed" required value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase text-muted-foreground">Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-xs font-bold uppercase text-muted-foreground">Confirm Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12 rounded-xl" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg" disabled={isSigningUp}>
                                {isSigningUp ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                                {isSigningUp ? "Creating Account..." : "Create Account"}
                            </Button>
                        </form>
                         <div className="mt-8 text-center text-sm text-muted-foreground">
                           Already have an account?{" "}
                            <Link href="/login" className="underline font-bold text-primary">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
