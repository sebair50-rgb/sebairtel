
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
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  authUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signup = async (email: string, password: string, name: string) => {
      setLoading(true);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Firebase Auth profile
        await updateProfile(cred.user, { 
            displayName: name,
            photoURL: `https://placehold.co/128x128/6366f1/ffffff?text=${encodeURIComponent(name.charAt(0))}`
        });
        
        // Send verification email
        await sendEmailVerification(cred.user);
        
        // Create Firestore user document
        await setDoc(doc(db, 'users', cred.user.uid), {
            name, 
            email, 
            avatar: `https://placehold.co/128x128/6366f1/ffffff?text=${encodeURIComponent(name.charAt(0))}`,
            friends: [], 
            friendRequestsReceived: [], 
            friendRequestsSent: [], 
            isOnline: true, 
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        // Crucial: Sign out after signup so the user must verify before entering the app
        await signOut(auth);
        
        return cred;
      } catch (error) {
          console.error("Signup process failed:", error);
          throw error;
      } finally {
        setLoading(false);
      }
  }
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
            await signOut(auth);
            const error = new Error("Email not verified.");
            (error as any).code = 'auth/email-not-verified';
            throw error;
        }
        return cred;
    } finally {
        setLoading(false);
    }
  }
  
  const logout = async () => await signOut(auth);
  const resendVerificationEmail = async () => { 
      if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser); 
      }
  };

  return <AuthContext.Provider value={{ authUser, loading, login, signup, logout, resendVerificationEmail }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
