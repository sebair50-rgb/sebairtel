
"use client";

import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '../shared/Logo';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isVerifyPage = pathname.startsWith('/verify-email');
    
    if (!authUser) {
      // Unauthenticated: Ensure they are on a safe page (login/signup)
      if (!isAuthPage && !isVerifyPage) {
        router.replace('/login');
      } else {
        setIsReady(true);
      }
    } else {
       // Authenticated: Strict handling of email verification
       if (!authUser.emailVerified) {
           // Mandatory redirect to verification if unverified
           if (!isVerifyPage) {
               router.replace(`/verify-email?email=${encodeURIComponent(authUser.email || '')}`);
           } else {
               setIsReady(true);
           }
       } else {
           // Verified users are not allowed on auth/verify pages
           if (isAuthPage || isVerifyPage) {
               router.replace('/');
           } else {
               setIsReady(true);
           }
       }
    }
  }, [authUser, loading, router, pathname]);

  // Global loading state for hydration and initial auth check
  if (loading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Securing professional session...</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthGuard;
