
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

interface AuthContextType {
  authUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const newUser: User = {
          id: user.uid,
          name,
          email: user.email!,
          avatar: name.charAt(0).toUpperCase(),
      };
      await setDoc(userDocRef, newUser);
      
      setAuthUser(user);
      return userCredential;
  }
  
  const login = async (email: string, password: string) => {
      return signInWithEmailAndPassword(auth, email, password);
  }
  
  const logout = async () => {
      await signOut(auth);
      setAuthUser(null);
  }

  const value = {
    authUser,
    loading,
    login,
    signup,
    logout,
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
