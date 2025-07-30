
"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

const ProfileSettings = () => {
    const { currentUser, updateUserProfile } = useAppContext();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [name, setName] = useState(currentUser?.name || '');
    const [dob, setDob] = useState<Date | undefined>(currentUser?.dob ? new Date(currentUser.dob) : undefined);
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

     useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setDob(currentUser.dob ? new Date(currentUser.dob) : undefined);
            setBio(currentUser.bio || '');
            setAvatarPreview(null);
            setAvatarFile(null);
        }
    }, [currentUser]);


    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) { // 1MB limit
                 toast({
                    variant: "destructive",
                    title: "حجم الصورة كبير جداً",
                    description: "الرجاء اختيار صورة حجمها أقل من 1 ميجابايت.",
                });
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        const updatePayload: Partial<Omit<User, 'id'>> = {};

        if (name.trim() && name.trim() !== currentUser.name) {
            updatePayload.name = name.trim();
        }
        
        const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
        if (formattedDob !== currentUser.dob) {
            updatePayload.dob = formattedDob;
        }
        
        if (bio.trim() !== (currentUser.bio || '')) {
            updatePayload.bio = bio.trim();
        }
        
        if (avatarPreview && avatarFile) {
             toast({
                variant: "destructive",
                title: "خطأ في رفع الصورة",
                description: "ميزة رفع الصور معطلة مؤقتاً.",
            });
            setAvatarPreview(null);
            setAvatarFile(null);
        }

        if (Object.keys(updatePayload).length === 0) {
            toast({ description: "لا توجد تغييرات لحفظها." });
            return;
        }

        if (updatePayload.name === '') {
             toast({
                variant: "destructive",
                title: "الاسم مطلوب",
                description: "لا يمكن ترك حقل الاسم فارغًا.",
            });
            return;
        }

        startTransition(async () => {
            try {
                await updateUserProfile(updatePayload);
                setAvatarPreview(null);
                setAvatarFile(null);
                toast({
                    title: "تم بنجاح!",
                    description: "تم تحديث معلومات ملفك الشخصي بنجاح.",
                });
            } catch (error: any) {
                console.error("Failed to update profile:", error);
                const description = error.message.includes('bytes')
                    ? "حجم الصورة كبير جدًا. الرجاء اختيار صورة أصغر."
                    : "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.";

                toast({
                    variant: "destructive",
                    title: "حدث خطأ",
                    description,
                });
            }
        });
    };

    if (!currentUser) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader2 className="animate-spin" />
                        <span>...جاري تحميل بيانات المستخدم</span>
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
    const hasChanges =
      (name.trim() !== (currentUser.name || '') && name.trim() !== "") ||
      (formattedDob !== (currentUser.dob || undefined)) ||
      (bio.trim() !== (currentUser.bio || '')) ||
      !!avatarFile;


    return (
        <Card>
            <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
                <CardDescription>هذه هي معلومات ملفك الشخصي العامة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarSelect}
                    className="hidden"
                    accept="image/*"
                />
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24 text-4xl">
                            <AvatarImage src={avatarPreview || currentUser?.avatar || undefined} alt={name} />
                            <AvatarFallback>{name.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <Button 
                          size="icon" 
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 border-2 border-card" 
                          onClick={() => toast({description: "ميزة رفع الصور معطلة مؤقتاً."})}>
                            <Camera className="w-4 h-4"/>
                            <span className="sr-only">تغيير الصورة</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bio">نبذة عني</Label>
                        <Textarea id="bio" placeholder="اكتب شيئًا عن نفسك..." value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob">تاريخ الميلاد</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dob && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {dob ? format(dob, "PPP", { locale: ar }) : <span>اختر تاريخ ميلادك</span>}
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
                                    toYear={new Date().getFullYear()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges}>
                        {isPending && <Loader2 className="ml-2 animate-spin" />}
                        {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
