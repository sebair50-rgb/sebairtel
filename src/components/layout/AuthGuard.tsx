
"use client";

import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '../shared/Logo';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  useEffect(() => {
    // If auth state is done loading
    if (!authLoading) {
      // And there's no user, redirect to login
      if (!authUser) {
        router.push('/login');
      } else {
        // If there is a user, the check is complete
        setIsInitialCheck(false);
      }
    }
  }, [authUser, authLoading, router]);

  // While auth state is loading OR if there is no authenticated user yet, show loader.
  // This prevents flashing the app content before the redirect can happen.
  if (authLoading || isInitialCheck) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Logo />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        <p className="text-muted-foreground mt-2">جاري التحميل...</p>
      </div>
    );
  }

  // If we have an authenticated user and the initial check is done, render the app.
  return <>{children}</>;
};

export default AuthGuard;
