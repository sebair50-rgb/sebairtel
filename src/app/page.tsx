"use client";

import AuthGuard from '@/components/layout/AuthGuard';
import AppShell from '@/components/layout/AppShell';

export default function Home() {
  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}
