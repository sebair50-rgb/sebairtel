
"use client";

import React, { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone, Briefcase, GraduationCap, Home, MapPin, Heart, Link as LinkIcon, PlusCircle, Trash2, UploadCloud, Sparkles, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import type { User, WorkExperience, Education, UserLink } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { Progress } from '../ui/progress';

const DetailSection = ({ title, description, children, icon: Icon }: { title: string, description?: string, children: React.ReactNode, icon: React.ElementType }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-xl tracking-tight">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </div>
        <div className="grid gap-6">
            {children}
        </div>
        <Separator className="mt-10" />
    </div>
);

const ProfileSettings = () => {
    const { currentUser, updateUserProfile } = useAppContext();
    const { toast } = useToast();
    const router = useRouter();
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    
    const [initialState, setInitialState] = useState<Partial<User>>({});
    const [formState, setFormState] = useState<Partial<User>>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const hasInitialized = useRef(false);

     useEffect(() => {
        if (currentUser && !hasInitialized.current) {
            const initialData: Partial<User> = {
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                dob: currentUser.dob || undefined,
                bio: currentUser.bio || '',
                city: currentUser.city || '',
                from: currentUser.from || '',
                relationshipStatus: currentUser.relationshipStatus || '',
                links: currentUser.links || [],
                workExperience: currentUser.workExperience || [],
                education: currentUser.education || [],
                avatar: currentUser.avatar || '',
            };
            setInitialState(initialData);
            setFormState(initialData);
            setAvatarPreview(currentUser.avatar || null);
            hasInitialized.current = true;
        }
    }, [currentUser]);
    
    const hasChanges = useMemo(() => {
        const mainFormChanged = JSON.stringify(formState) !== JSON.stringify(initialState);
        const filesChanged = !!avatarFile;
        return mainFormChanged || filesChanged;
    }, [formState, initialState, avatarFile]);

    const profileCompletion = useMemo(() => {
        if (!formState || !currentUser) return 0;
        const fields = ['name', 'bio', 'phone', 'dob', 'city', 'from', 'relationshipStatus', 'avatar'];
        const filledFields = fields.filter(f => !!(formState as any)[f]);
        const hasLists = (formState.links?.length || 0) > 0 || (formState.workExperience?.length || 0) > 0 || (formState.education?.length || 0) > 0;
        return Math.min(100, Math.round(((filledFields.length + (hasLists ? 1 : 0)) / (fields.length + 1)) * 100));
    }, [formState, currentUser]);

    const handleFieldChange = (field: keyof User, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2097152) { // 2MB limit
                 toast({ variant: "destructive", title: "Image size is too large", description: "Please choose an image smaller than 2MB." });
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const addToList = <T extends UserLink | WorkExperience | Education>(
        field: 'links' | 'workExperience' | 'education', 
        newItem: T
    ) => {
        const currentList = (formState[field] as T[] | undefined) || [];
        handleFieldChange(field, [...currentList, newItem]);
    };

    const removeFromList = (field: 'links' | 'workExperience' | 'education', index: number) => {
        const currentList = (formState[field] as any[]) || [];
        handleFieldChange(field, currentList.filter((_, i) => i !== index));
    };

    const handleSaveChanges = () => {
        if (!currentUser || !hasChanges) return;
        startTransition(async () => {
            try {
                let updatePayload: Partial<User> = {};
                (Object.keys(formState) as Array<keyof typeof formState>).forEach(key => {
                    if (JSON.stringify(formState[key]) !== JSON.stringify(initialState[key])) {
                        (updatePayload as any)[key] = formState[key];
                    }
                });
                
                const filesToUpload: { avatar?: File } = {};
                if (avatarFile) filesToUpload.avatar = avatarFile;
                
                await updateUserProfile(updatePayload, filesToUpload);
                
                toast({ title: "Profile updated!", description: "Your changes have been saved successfully." });
                setInitialState(formState);
                setAvatarFile(null);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save profile changes." });
            }
        });
    };

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <p className="text-muted-foreground animate-pulse">Initializing your profile...</p>
            </div>
        )
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Edit Profile</CardTitle>
                        <CardDescription className="text-base">Manage your public information and digital identity.</CardDescription>
                    </div>
                    <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Profile Strength</span>
                            <span>{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-0 space-y-12">
                <div className="bg-card border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 text-5xl ring-4 ring-primary/10 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                                <AvatarImage src={avatarPreview || undefined} alt={formState.name} />
                                <AvatarFallback className="bg-slate-100">{formState.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 border-4 border-card shadow-lg hover:scale-110 transition-all">
                                        <Camera className="w-5 h-5"/>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[450px]">
                                    <DialogHeader>
                                        <DialogTitle>Update Profile Picture</DialogTitle>
                                        <DialogDescription>Choose a source for your new avatar image.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-6">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full h-24 justify-start gap-6 p-6 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all group" onClick={() => avatarFileInputRef.current?.click()}>
                                                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors"><UploadCloud className="w-6 h-6 text-primary" /></div>
                                                <div className="text-left">
                                                    <p className="font-bold">Upload from Device</p>
                                                    <p className="text-sm text-muted-foreground">JPG, PNG or WEBP. Max 2MB.</p>
                                                </div>
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full h-24 justify-start gap-6 p-6 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all group" onClick={() => router.push('/avatar-generator')}>
                                                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors"><Sparkles className="w-6 h-6 text-primary" /></div>
                                                <div className="text-left">
                                                    <p className="font-bold">Generate with AI</p>
                                                    <p className="text-sm text-muted-foreground">Create a unique persona using GenAI.</p>
                                                </div>
                                            </Button>
                                        </DialogClose>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h2 className="text-2xl font-bold">{formState.name}</h2>
                            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                Verified Member
                            </p>
                            <div className="pt-2">
                                <input type="file" ref={avatarFileInputRef} onChange={handleAvatarSelect} className="hidden" accept="image/*" />
                                <Button variant="secondary" size="sm" className="rounded-full px-6" onClick={() => avatarFileInputRef.current?.click()}>
                                    Change Picture
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DetailSection title="Basic Information" description="Your primary details that help people identify you." icon={UserIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-muted-foreground flex items-center gap-2">Full Name <span className="text-destructive">*</span></Label>
                            <Input id="name" value={formState.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="h-12 rounded-xl bg-background border-2 focus:ring-primary" placeholder="Enter your full name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-sm font-bold text-muted-foreground flex items-center gap-2">Date of Birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full h-12 justify-start text-left font-normal rounded-xl border-2",!formState.dob && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formState.dob ? format(new Date(formState.dob), "PPP", { locale: enUS }) : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl" align="start">
                                    <Calendar mode="single" selected={formState.dob ? new Date(formState.dob) : undefined} onSelect={(date) => handleFieldChange('dob', date ? date.toISOString() : undefined)} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-bold text-muted-foreground flex items-center gap-2">Professional Bio</Label>
                        <Textarea id="bio" placeholder="Tell the world about yourself..." value={formState.bio || ''} onChange={(e) => handleFieldChange('bio', e.target.value)} className="min-h-[120px] rounded-xl bg-background border-2 p-4 leading-relaxed" />
                    </div>
                </DetailSection>

                <DetailSection title="Contact & Location" description="How others can reach you or where you're based." icon={Phone}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-bold text-muted-foreground">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="phone" type="tel" value={formState.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="pl-12 h-12 rounded-xl bg-background border-2" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-bold text-muted-foreground">Current City</Label>
                            <div className="relative">
                                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="city" value={formState.city || ''} onChange={(e) => handleFieldChange('city', e.target.value)} className="pl-12 h-12 rounded-xl bg-background border-2" placeholder="e.g. San Francisco, CA" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from" className="text-sm font-bold text-muted-foreground">Hometown</Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="from" value={formState.from || ''} onChange={(e) => handleFieldChange('from', e.target.value)} className="pl-12 h-12 rounded-xl bg-background border-2" placeholder="e.g. Cairo, Egypt" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="relationship" className="text-sm font-bold text-muted-foreground">Relationship Status</Label>
                            <div className="relative">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="relationship" value={formState.relationshipStatus || ''} onChange={(e) => handleFieldChange('relationshipStatus', e.target.value)} className="pl-12 h-12 rounded-xl bg-background border-2" placeholder="e.g. Single, Married..." />
                            </div>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Portfolio & Social" description="Link your external profiles or personal website." icon={LinkIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formState.links?.map((link, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-background border-2 border-primary/10 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-primary/5 p-2 rounded-lg"><LinkIcon className="w-4 h-4 text-primary" /></div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm truncate">{link.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromList('links', index)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                        <AddDialog type="link" onAdd={(item) => addToList('links', item as UserLink)} />
                    </div>
                </DetailSection>

                <div className="sticky bottom-6 md:bottom-10 z-30 pt-8 animate-in slide-in-from-bottom-8 duration-700">
                    <Card className="bg-primary shadow-2xl shadow-primary/30 border-none rounded-2xl overflow-hidden">
                        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-primary-foreground">
                                {hasChanges ? <AlertCircle className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
                                <div>
                                    <p className="font-bold text-lg">{hasChanges ? "You have unsaved changes" : "Your profile is up to date"}</p>
                                    <p className="text-sm opacity-80">{hasChanges ? "Make sure to save your modifications before leaving." : "Everything is synced with our servers."}</p>
                                </div>
                            </div>
                            <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges} className="w-full md:w-auto h-12 px-10 rounded-xl bg-white text-primary hover:bg-slate-100 font-bold text-lg shadow-xl shadow-black/10 transition-all active:scale-95">
                                {isPending ? <Loader2 className="mr-2 animate-spin h-5 w-5" /> : null}
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
};

const AddDialog = ({ type, onAdd }: { type: 'link' | 'work' | 'education', onAdd: (item: any) => void }) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const { toast } = useToast();
    const handleAdd = () => {
        if (!title.trim() || !subtitle.trim()) {
            toast({ variant: 'destructive', title: "Missing details", description: "Please fill in all fields." });
            return;
        }
        const item = type === 'link' ? { title, url: subtitle } : type === 'work' ? { title, company: subtitle } : { school: title, degree: subtitle };
        onAdd(item); setTitle(''); setSubtitle('');
    };
    const config = {
        link: { title: 'Add New Link', titleLabel: 'Platform', subtitleLabel: 'URL', titlePlaceholder: 'Website', subtitlePlaceholder: 'https://...', icon: LinkIcon },
        work: { title: 'Add Work', titleLabel: 'Title', subtitleLabel: 'Company', titlePlaceholder: 'Role', subtitlePlaceholder: 'Company name', icon: Briefcase },
        education: { title: 'Add Education', titleLabel: 'School', subtitleLabel: 'Degree', titlePlaceholder: 'University', subtitlePlaceholder: 'Master...', icon: GraduationCap },
    }[type];
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add {type}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-3xl">
                <DialogHeader className="space-y-3">
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-2"><config.icon className="w-6 h-6 text-primary" /></div>
                    <DialogTitle className="text-2xl font-extrabold">{config.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-bold text-muted-foreground">{config.titleLabel}</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={config.titlePlaceholder} className="h-12 rounded-xl bg-slate-50 border-2" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subtitle" className="text-sm font-bold text-muted-foreground">{config.subtitleLabel}</Label>
                        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={config.subtitlePlaceholder} className="h-12 rounded-xl bg-slate-50 border-2" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleAdd}>Add Item</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileSettings;
