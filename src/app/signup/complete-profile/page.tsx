
"use client";

import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
        // Pre-fill name from auth if available
        if (user.displayName) {
            setName(user.displayName);
        }
        // Check if profile is already complete
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().name) {
                // Profile seems complete, maybe redirect home?
                // For now, we allow them to update it.
                const data = docSnap.data();
                setName(data.name || '');
                setPhone(data.phone || '');
                if (data.dob) {
                    setDob(new Date(data.dob));
                }
            }
        });
    }
  }, [user, loading]);

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name || !dob || !phone) {
        toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الرجاء ملء جميع الحقول.' });
        return;
    }

    setIsLoading(true);
    try {
      const newUser: User = {
        id: user.uid,
        name: name,
        email: user.email || '',
        avatar: name.charAt(0).toUpperCase() || 'م',
        phone: phone,
        dob: dob.toISOString(),
      };
      await setDoc(doc(db, "users", user.uid), newUser, { merge: true });

      toast({ 
        title: "اكتمل الملف الشخصي!", 
        description: "أهلاً بك في مجتمعنا. يتم الآن توجيهك للصفحة الرئيسية.",
      });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في حفظ البيانات", description: "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى." });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserCheck className="w-16 h-16 text-primary" />
            </div>
          <CardTitle className="text-2xl">استكمال الملف الشخصي</CardTitle>
          <CardDescription>أخبرنا المزيد عن نفسك لإنهاء الإعداد.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileCompletion}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" placeholder="مثال: أحمد محمد" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" type="tel" placeholder="+966 12 345 6789" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="dob">تاريخ الميلاد</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="dob"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : <span>اختر تاريخًا</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear() - 10}
                     />
                    </PopoverContent>
                </Popover>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin ml-2" /> : 'حفظ وإنهاء'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
