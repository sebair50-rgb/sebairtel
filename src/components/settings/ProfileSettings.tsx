
"use client";

import React, { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone, Briefcase, GraduationCap, Home, MapPin, Heart, Link as LinkIcon, PlusCircle, Trash2, UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
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


const DetailSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: React.ElementType }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {children}
        <Separator className="mt-6" />
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

     useEffect(() => {
        if (currentUser) {
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
            setAvatarFile(null);
        }
    }, [currentUser]);
    
    const hasChanges = useMemo(() => {
        const mainFormChanged = JSON.stringify(formState) !== JSON.stringify(initialState);
        const filesChanged = !!avatarFile;
        return mainFormChanged || filesChanged;
    }, [formState, initialState, avatarFile]);


    const handleFieldChange = (field: keyof User, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) { // 1MB limit
                 toast({ variant: "destructive", title: "Image size is too large", description: "Please choose an image smaller than 1MB." });
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
                
                toast({ title: "Success!", description: "Your profile has been updated." });
                
                // Reset initial state to reflect saved changes
                setInitialState(formState);
                setAvatarFile(null);

            } catch (error: any) {
                console.error("Failed to update profile:", error);
                const description = error.message || "An unexpected error occurred.";
                toast({ variant: "destructive", title: "An error occurred", description });
            }
        });
    };

    if (!currentUser) {
        return (
            <Card>
                <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                <CardContent><div className="flex items-center space-x-4"><Loader2 className="animate-spin" /><span>Loading...</span></div></CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <input type="file" ref={avatarFileInputRef} onChange={handleAvatarSelect} className="hidden" accept="image/*" />
                
                <div className="flex items-center gap-6">
                    <div className="relative">
                         <Avatar className="w-24 h-24 text-4xl">
                            <AvatarImage src={avatarPreview || undefined} alt={formState.name} />
                            <AvatarFallback>{formState.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <Dialog>
                            <DialogTrigger asChild>
                                 <Button size="icon" className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 border-2 border-card">
                                    <Camera className="w-4 h-4"/><span className="sr-only">Change Picture</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Update Profile Picture</DialogTitle>
                                    <DialogDescription>
                                        Choose how you would like to update your avatar.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                     <DialogClose asChild>
                                        <Button variant="outline" className="w-full justify-start gap-4 p-6" onClick={() => avatarFileInputRef.current?.click()}>
                                            <UploadCloud className="w-6 h-6 text-primary" />
                                            <div>
                                                <p className="font-semibold text-left">Upload from Device</p>
                                                <p className="text-xs text-muted-foreground text-left">Select an image from your computer or phone</p>
                                            </div>
                                        </Button>
                                    </DialogClose>
                                     <Button variant="outline" className="w-full justify-start gap-4 p-6" onClick={() => toast({description: "This feature will be available soon."})}>
                                        <ImageIcon className="w-6 h-6 text-primary" />
                                        <div>
                                                <p className="font-semibold text-left">Choose from Photos</p>
                                                <p className="text-xs text-muted-foreground text-left">Use an image you have already uploaded</p>
                                            </div>
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant="outline" className="w-full justify-start gap-4 p-6" onClick={() => router.push('/avatar-generator')}>
                                            <Sparkles className="w-6 h-6 text-primary" />
                                            <div>
                                                    <p className="font-semibold text-left">Create with AI</p>
                                                    <p className="text-xs text-muted-foreground text-left">Generate a unique avatar using AI</p>
                                            </div>
                                        </Button>
                                    </DialogClose>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{formState.name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formState.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="bio">About Me (Professional Summary)</Label><Textarea id="bio" placeholder="Write something about yourself..." value={formState.bio || ''} onChange={(e) => handleFieldChange('bio', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={currentUser.email || ''} disabled /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formState.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} placeholder="e.g., +1234567890" /></div>
                    <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formState.dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formState.dob ? format(new Date(formState.dob), "PPP", { locale: enUS }) : <span>Pick your date of birth</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formState.dob ? new Date(formState.dob) : undefined} onSelect={(date) => handleFieldChange('dob', date ? date.toISOString() : undefined)} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} /></PopoverContent></Popover></div>
                </div>

                <Separator />
                
                <div className="space-y-6">
                    <DetailSection title="Portfolio" icon={LinkIcon}>
                        <div className="space-y-2">
                            {formState.links?.map((link, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-primary truncate hover:underline">{link.title}</a>
                                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromList('links', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </div>
                        <AddDialog type="link" onAdd={(item) => addToList('links', item as UserLink)} />
                    </DetailSection>

                    <DetailSection title="Work Experience" icon={Briefcase}>
                         <div className="space-y-2">
                            {formState.workExperience?.map((work, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                                     <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                     <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold">{work.title}</p>
                                        <p className="text-sm text-muted-foreground">{work.company}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromList('workExperience', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </div>
                        <AddDialog type="work" onAdd={(item) => addToList('workExperience', item as WorkExperience)} />
                    </DetailSection>
                    
                    <DetailSection title="Education" icon={GraduationCap}>
                        <div className="space-y-2">
                            {formState.education?.map((edu, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                                    <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold">{edu.degree}</p>
                                        <p className="text-sm text-muted-foreground">{edu.school}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromList('education', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </div>
                         <AddDialog type="education" onAdd={(item) => addToList('education', item as Education)} />
                    </DetailSection>
                    
                    <DetailSection title="Current City" icon={Home}><Input id="city" value={formState.city || ''} onChange={(e) => handleFieldChange('city', e.target.value)} placeholder="e.g., Dubai" /></DetailSection>
                    <DetailSection title="Hometown" icon={MapPin}><Input id="from" value={formState.from || ''} onChange={(e) => handleFieldChange('from', e.target.value)} placeholder="e.g., Riyadh" /></DetailSection>
                    <DetailSection title="Relationship" icon={Heart}><Input id="relationship" value={formState.relationshipStatus || ''} onChange={(e) => handleFieldChange('relationshipStatus', e.target.value)} placeholder="e.g., Single, Married..." /></DetailSection>
                </div>

                <div className="flex justify-end mt-8">
                    <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges} className="w-full md:w-auto">
                        {isPending && <Loader2 className="mr-2 animate-spin" />}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
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
        if (type === 'link' && (!title || !subtitle)) {
            toast({ variant: 'destructive', title: "Invalid Link", description: "Please provide both a title and a URL." });
            return;
        }
         if (type === 'work' && (!title || !subtitle)) {
            toast({ variant: 'destructive', title: "Invalid Work Entry", description: "Please provide both a job title and company." });
            return;
        }
        if (type === 'education' && (!title || !subtitle)) {
            toast({ variant: 'destructive', title: "Invalid Education Entry", description: "Please provide both a school and a degree." });
            return;
        }

        const item = type === 'link' ? { title, url: subtitle } :
                     type === 'work' ? { title, company: subtitle } :
                     { school: title, degree: subtitle };
        onAdd(item);
        setTitle('');
        setSubtitle('');
    };
    
    const config = {
        link: { title: 'Add New Link', titleLabel: 'Link Title', subtitleLabel: 'URL', titlePlaceholder: 'e.g., My Portfolio', subtitlePlaceholder: 'https://...' },
        work: { title: 'Add Work Experience', titleLabel: 'Job Title', subtitleLabel: 'Company Name', titlePlaceholder: 'e.g., Software Engineer', subtitlePlaceholder: 'e.g., Google' },
        education: { title: 'Add Education', titleLabel: 'School / University', subtitleLabel: 'Degree / Certificate', titlePlaceholder: 'e.g., MIT', subtitlePlaceholder: 'e.g., B.S. in Computer Science' },
    }[type];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{config.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{config.titleLabel}</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={config.titlePlaceholder}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subtitle">{config.subtitleLabel}</Label>
                        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={config.subtitlePlaceholder} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button onClick={handleAdd}>Add Item</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileSettings;
