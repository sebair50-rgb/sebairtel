
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
    // If we are currently in the middle of a signup process, hold the UI
    if (loading || isSigningUp) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isVerifyPage = pathname.startsWith('/verify-email');
    
    // Gating Logic:
    // 1. No User -> Force Login (unless on login/signup)
    if (!authUser) {
      if (!isAuthPage) {
        router.replace('/login');
      } else {
        setIsReady(true);
      }
      return;
    }

    // 2. User exists but not verified -> Force /verify-email
    if (!authUser.emailVerified) {
      if (!isVerifyPage) {
        router.replace(`/verify-email?email=${encodeURIComponent(authUser.email || '')}`);
      } else {
        setIsReady(true);
      }
      return;
    }

    // 3. User exists and is verified -> Prevent /login, /signup, /verify-email
    if (isAuthPage || isVerifyPage) {
      router.replace('/');
      return;
    }

    // 4. Everything is fine
    setIsReady(true);
  }, [authUser, loading, isSigningUp, router, pathname]);

  if (loading || isSigningUp || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-6">
        <Logo className="w-16 h-16" />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-6" />
        <p className="text-muted-foreground mt-4 text-sm font-medium animate-pulse">
          {isSigningUp ? "Creating your secure environment..." : "Securing professional session..."}
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthGuard;
