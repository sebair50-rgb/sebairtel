
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
    if (loading) return; // Wait until loading is false

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify-email');
    
    // If not authenticated, redirect to login page, unless they are already on an auth page.
    if (!authUser) {
      if (!isAuthPage) {
        router.push('/login');
      }
    } else {
       // If authenticated and on an auth page, redirect to home.
       if (isAuthPage) {
           router.push('/');
       }
    }
  }, [authUser, loading, router, pathname]);

  // While loading, show a spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }
  
  // If authenticated and not on an auth page, or if not authenticated and on an auth page, show children
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify-email');
  if ((authUser && !isAuthPage) || (!authUser && isAuthPage)) {
    return <>{children}</>;
  }

  // Fallback loading state to prevent flicker
  return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">Redirecting...</p>
      </div>
    );
};

export default AuthGuard;
