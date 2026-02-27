
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
      // Not logged in: allow auth pages, otherwise redirect to login
      if (!isAuthPage && !isVerifyPage) {
        router.push('/login');
      }
    } else {
       // Logged in:
       if (!authUser.emailVerified) {
           // Not verified: force verify page unless already there
           if (!isVerifyPage) {
               router.push(`/verify-email?email=${encodeURIComponent(authUser.email || '')}`);
           }
       } else {
           // Verified: redirect to home if on auth/verify pages
           if (isAuthPage || isVerifyPage) {
               router.push('/');
           }
       }
    }
  }, [authUser, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Loading system...</p>
      </div>
    );
  }
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isVerifyPage = pathname.startsWith('/verify-email');

  // Logic to determine if we should show the children (the page content)
  const shouldShowContent = 
    (!authUser && (isAuthPage || isVerifyPage)) || 
    (authUser && !authUser.emailVerified && isVerifyPage) ||
    (authUser && authUser.emailVerified && !isAuthPage && !isVerifyPage);

  if (shouldShowContent) {
    return <>{children}</>;
  }

  return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Redirecting to safe zone...</p>
      </div>
    );
};

export default AuthGuard;
