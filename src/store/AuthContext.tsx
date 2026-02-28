
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
  reload,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  authUser: FirebaseUser | null;
  loading: boolean;
  isSigningUp: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setAuthUser({ ...auth.currentUser });
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
      setIsSigningUp(true);
      try {
        // 1. Create Auth Account
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Set Profile Display Name and Avatar Placeholder
        const avatarUrl = `https://placehold.co/128x128/793EF6/ffffff?text=${encodeURIComponent(name.charAt(0))}`;
        await updateProfile(cred.user, { 
            displayName: name,
            photoURL: avatarUrl
        });

        // 3. Trigger Verification Email immediately
        await sendEmailVerification(cred.user);

        // 4. Provision Firestore Profile (Non-blocking)
        // We do not throw if this fails, to prevent marking registration as failed
        try {
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
        } catch (fsError) {
            console.error("Firestore profile provisioning delayed or failed:", fsError);
        }

        return cred;
      } finally {
        setIsSigningUp(false);
      }
  }
  
  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const logout = async () => {
      setLoading(true);
      try {
          if (auth.currentUser) {
              // Update status before signing out
              try {
                  await setDoc(doc(db, 'users', auth.currentUser.uid), { 
                      isOnline: false, 
                      lastSeen: serverTimestamp() 
                  }, { merge: true });
              } catch (e) {
                  console.warn("Could not update online status during logout", e);
              }
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
        resendVerificationEmail,
        refreshUser
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
