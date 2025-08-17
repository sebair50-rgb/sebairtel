
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-black">
      <header className="p-4 border-b bg-background sticky top-0 z-10 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">AI Creativity Center</h1>
      </header>
      <ScrollArea className="flex-1">
        <main className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
             {children}
            </div>
        </main>
      </ScrollArea>
    </div>
  );
}
