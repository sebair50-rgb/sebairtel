
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
      setLoading(true); // Start loading
      
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

      if (user) {
        // User is logged in, reload to get fresh data
        await user.reload();
        const freshUser = auth.currentUser;
        setUser(freshUser);

        if (freshUser && !freshUser.emailVerified) {
          // If email is not verified, they should be on the verify page
          if (pathname !== '/signup/verify-email') {
             router.push('/signup/verify-email');
          }
        } else if (freshUser) {
          // Email is verified, check if profile is complete
          const userDoc = await getDoc(doc(db, "users", freshUser.uid));
          if (!userDoc.exists() || !userDoc.data()?.dob) {
            // Profile is not complete, send to complete profile page
            if (pathname !== '/signup/complete-profile') {
                router.push('/signup/complete-profile');
            }
          } else {
            // Profile is complete, send to main app if they are on an auth page
            if (isAuthPage) {
              router.push('/');
            }
          }
        }
      } else {
        // User is not logged in
        setUser(null);
        // send to login unless they are already on a public auth page
        if (!isAuthPage) {
          router.push('/login');
        }
      }
       setLoading(false); // End loading
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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
