
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

      if (user) {
        // User is logged in
        if (!user.emailVerified) {
          // If email is not verified, they should be on the verify page
          if (pathname !== '/signup/verify-email') {
             router.push('/signup/verify-email');
          }
        } else {
          // Email is verified, check if profile is complete
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists() || !userDoc.data().dob) {
            // Profile is not complete, send to complete profile page
            if (pathname !== '/signup/complete-profile') {
                router.push('/signup/complete-profile');
            }
          } else {
            // Profile is complete, send to main app
            if (isAuthPage) {
              router.push('/');
            }
          }
        }
      } else {
        // User is not logged in, send to login unless they are already on an auth page
        if (!isAuthPage) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
