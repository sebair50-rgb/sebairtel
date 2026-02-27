
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
    const { signup, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: "Weak Password",
                description: "Password should be at least 6 characters long.",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please make sure you've entered the same password twice.",
            });
            return;
        }

        try {
            await signup(email, password, name);
            // After signup, the user is signed out in AuthContext to force verification
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            console.error("Signup Error:", error);
            let description = 'An unexpected error occurred, please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email is already in use.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'The email address is badly formatted.';
            } else if (error.code === 'auth/weak-password') {
                description = 'The password is too weak.';
            } else if (error.message) {
                description = error.message;
            }

             toast({
                variant: "destructive",
                title: "Signup Failed",
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
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Create a New Account</CardTitle>
                        <CardDescription>Join us today and start your journey!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" type="text" placeholder="e.g., Ali Mohammed" required value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                            </Button>
                        </form>
                         <div className="mt-4 text-center text-sm">
                           Already have an account?{" "}
                            <Link href="/login" className="underline text-primary">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
