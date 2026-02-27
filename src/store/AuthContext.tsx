
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
  setPersistence,
  browserLocalPersistence,
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
    setPersistence(auth, browserLocalPersistence);

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
        
        // 1. Update Profile first so the AuthGuard sees the name immediately
        await updateProfile(cred.user, { 
            displayName: name,
            photoURL: `https://placehold.co/128x128/793EF6/ffffff?text=${encodeURIComponent(name.charAt(0))}`
        });

        // 2. Create Firestore user document
        await setDoc(doc(db, 'users', cred.user.uid), {
            id: cred.user.uid,
            name, 
            email, 
            avatar: `https://placehold.co/128x128/793EF6/ffffff?text=${encodeURIComponent(name.charAt(0))}`,
            friends: [], 
            friendRequestsReceived: [], 
            friendRequestsSent: [], 
            isOnline: true, 
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp(),
            settings: {
                theme: 'system',
                language: 'system',
                notifications: { all: true, messages: true, mentions: true, calls: true },
                privacy: { lastSeen: 'everyone', profilePhoto: 'everyone', friendRequests: 'everyone' },
                sounds: { messageTone: 'default', notificationTone: 'default', callRingtone: 'default' },
                interface: { showSocialTab: true, showAiTab: true, showAppsTab: true, showContactTab: true }
            }
        });
        
        // 3. Send verification email
        await sendEmailVerification(cred.user);

        // We do NOT sign out here anymore. The AuthGuard will handle the unverified state.
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
            const emailAddr = cred.user.email;
            // For login, we do sign out if not verified to prevent accessing the app
            await signOut(auth);
            const error = new Error("Email not verified.");
            (error as any).code = 'auth/email-not-verified';
            (error as any).email = emailAddr;
            throw error;
        }
        return cred;
    } finally {
        setLoading(false);
    }
  }
  
  const logout = async () => {
      setLoading(true);
      try {
          await signOut(auth);
      } finally {
          setLoading(false);
      }
  };

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
