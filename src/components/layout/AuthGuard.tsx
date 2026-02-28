
"use client";

import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '../shared/Logo';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading, isSigningUp } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If the system is performing a background signup task, freeze the guard 
    // to prevent redirection race conditions.
    if (loading || isSigningUp) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isVerifyPage = pathname.startsWith('/verify-email');
    
    // Facebook-style gating logic:
    // 1. Not logged in -> Redirect to login if not already on an auth screen.
    // 2. Logged in + Not Verified -> Redirect to /verify-email immediately.
    // 3. Logged in + Verified -> Redirect to home IF on login/signup/verify pages.
    
    if (!authUser) {
      if (!isAuthPage && !isVerifyPage) {
        router.replace('/login');
      } else {
        setIsReady(true);
      }
    } else {
       if (!authUser.emailVerified) {
           if (!isVerifyPage) {
               router.replace(`/verify-email?email=${encodeURIComponent(authUser.email || '')}`);
           } else {
               setIsReady(true);
           }
       } else {
           if (isAuthPage || isVerifyPage) {
               router.replace('/');
           } else {
               setIsReady(true);
           }
       }
    }
  }, [authUser, loading, isSigningUp, router, pathname]);

  // Global splash screen for hydration and system-level state transitions
  if (loading || isSigningUp || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-4 text-sm font-medium animate-pulse">
          {isSigningUp ? "Creating your secure environment..." : "Securing professional session..."}
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthGuard;
