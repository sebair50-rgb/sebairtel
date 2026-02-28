
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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

interface AuthContextType {
  authUser: FirebaseUser | null;
  loading: boolean;
  isSigningUp: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    // Ensure persistence is set before observing auth state
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signup = async (email: string, password: string, name: string) => {
      setIsSigningUp(true);
      setLoading(true);
      try {
        // 1. Create Auth Account
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Set Profile Display Name and Avatar Placeholder
        const avatarUrl = `https://placehold.co/128x128/793EF6/ffffff?text=${encodeURIComponent(name.charAt(0))}`;
        await updateProfile(cred.user, { 
            displayName: name,
            photoURL: avatarUrl
        });

        // 3. Provision Database Record immediately
        // This ensures the data is ready before any redirection happens
        await setDoc(doc(db, 'users', cred.user.uid), {
            id: cred.user.uid,
            name, 
            email, 
            avatar: avatarUrl,
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
        
        // 4. Trigger Verification Email
        await sendEmailVerification(cred.user);

        return cred;
      } catch (error) {
          console.error("Critical Signup failure:", error);
          throw error;
      } finally {
        setIsSigningUp(false);
        setLoading(false);
      }
  }
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        
        // Update user's online status upon successful login
        const userRef = doc(db, 'users', cred.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            await setDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() }, { merge: true });
        }

        return cred;
    } finally {
        setLoading(false);
    }
  }
  
  const logout = async () => {
      setLoading(true);
      try {
          if (auth.currentUser) {
              await setDoc(doc(db, 'users', auth.currentUser.uid), { 
                  isOnline: false, 
                  lastSeen: serverTimestamp() 
              }, { merge: true });
          }
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

  return (
    <AuthContext.Provider value={{ 
        authUser, 
        loading, 
        isSigningUp, 
        login, 
        signup, 
        logout, 
        resendVerificationEmail 
    }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
