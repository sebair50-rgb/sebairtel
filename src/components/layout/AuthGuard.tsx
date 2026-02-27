
"use client";

import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '../shared/Logo';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isVerifyPage = pathname.startsWith('/verify-email');
    
    if (!authUser) {
      // User is not logged in
      if (!isAuthPage && !isVerifyPage) {
        router.replace('/login');
      }
    } else {
       // User IS logged in:
       if (!authUser.emailVerified) {
           // Forced redirect to verification if they haven't verified yet
           if (!isVerifyPage) {
               router.replace(`/verify-email?email=${encodeURIComponent(authUser.email || '')}`);
           }
       } else {
           // If verified, don't allow them on Auth or Verify pages
           if (isAuthPage || isVerifyPage) {
               router.replace('/');
           }
       }
    }
  }, [authUser, loading, router, pathname]);

  // Show loading screen during state transitions
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Securing session...</p>
      </div>
    );
  }
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isVerifyPage = pathname.startsWith('/verify-email');

  // Determine if content should be rendered to avoid flickering/UI flashes
  const shouldShowContent = 
    (!authUser && (isAuthPage || isVerifyPage)) || 
    (authUser && !authUser.emailVerified && isVerifyPage) ||
    (authUser && authUser.emailVerified && !isAuthPage && !isVerifyPage);

  if (shouldShowContent) {
    return <>{children}</>;
  }

  // Fallback while router.replace executes
  return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Redirecting to safe zone...</p>
      </div>
    );
};

export default AuthGuard;
