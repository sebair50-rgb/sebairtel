
"use client";

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, throw the error so it shows in the Next.js overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // In production, show a friendly toast
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have permission to perform this action. Please check your credentials.',
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [toast]);

  return <>{children}</>;
};
