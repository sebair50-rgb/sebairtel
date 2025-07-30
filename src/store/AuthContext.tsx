
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signup = async (email: string, password: string, name: string) => {
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        await sendEmailVerification(user);

        const userDocRef = doc(db, 'users', user.uid);
        const newUser: User = {
            id: user.uid,
            name,
            email: user.email!,
            avatar: `https://placehold.co/128x128/E6E6FA/333333.png?text=${name.charAt(0)}`,
        };
        await setDoc(userDocRef, newUser);
        
        return userCredential;
      } finally {
        setLoading(false);
      }
  }
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            const error = new Error("Email not verified.");
            (error as any).code = 'auth/email-not-verified';
            throw error;
        }
        return userCredential;
    } finally {
        setLoading(false);
    }
  }
  
  const logout = async () => {
      await signOut(auth);
  }

  const resendVerificationEmail = async () => {
      if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
      } else {
          throw new Error("No user is currently signed in to resend verification email.");
      }
  }

  const updateUserEmail = async (newEmail: string) => {
    if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        // Note: The email in Firestore will need to be updated via a different mechanism
        // once the user verifies the new email, ideally via a backend trigger or a page the user is redirected to.
        // For now, we only handle the auth part.
    } else {
        throw new Error("No user is currently signed in to update email.");
    }
  }


  const value = {
    authUser,
    loading,
    login,
    signup,
    logout,
    resendVerificationEmail,
    updateUserEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
