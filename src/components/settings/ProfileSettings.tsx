
"use client";

import React, { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone, Briefcase, GraduationCap, Home, MapPin, Heart, FileUp, Link as LinkIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import type { User, WorkExperience, Education, UserLink } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const cvFileInputRef = useRef<HTMLInputElement>(null);
    
    const [initialState, setInitialState] = useState<Partial<User>>({});
    const [formState, setFormState] = useState<Partial<User>>({
        name: '',
        phone: '',
        bio: '',
        city: '',
        from: '',
        relationshipStatus: '',
        links: [],
        workExperience: [],
        education: [],
        cvFileName: '',
    });
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);

    const [isPending, startTransition] = useTransition();

     useEffect(() => {
        if (currentUser) {
            const initialData = {
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                dob: currentUser.dob,
                bio: currentUser.bio || '',
                city: currentUser.city || '',
                from: currentUser.from || '',
                relationshipStatus: currentUser.relationshipStatus || '',
                links: currentUser.links || [],
                workExperience: currentUser.workExperience || [],
                education: currentUser.education || [],
                cvFileName: currentUser.cvFileName || '',
            };
            setInitialState(initialData);
            setFormState(initialData);

            // Reset file states on user change
            setAvatarFile(null);
            setAvatarPreview(null);
            setCvFile(null);
        }
    }, [currentUser]);

    const hasChanges = useMemo(() => {
        if (!currentUser) return false;
        if (avatarFile || cvFile) return true;
        // Deep comparison for arrays/objects
        return JSON.stringify(formState) !== JSON.stringify(initialState);
    }, [formState, initialState, avatarFile, cvFile, currentUser]);


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
    
    const handleCvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1048576) { // 5MB limit
                toast({ variant: "destructive", title: "File size is too large", description: "Please choose a file smaller than 5MB." });
                return;
            }
            setCvFile(file);
            handleFieldChange('cvFileName', file.name);
        }
    };
    
    const handleAddLink = () => {
        const { links = [] } = formState;
        const newLinkTitle = (document.getElementById('new-link-title') as HTMLInputElement)?.value;
        const newLinkUrl = (document.getElementById('new-link-url') as HTMLInputElement)?.value;

        if (newLinkTitle?.trim() && newLinkUrl?.trim()) {
            handleFieldChange('links', [...links, { title: newLinkTitle, url: newLinkUrl }]);
            (document.getElementById('new-link-title') as HTMLInputElement).value = '';
            (document.getElementById('new-link-url') as HTMLInputElement).value = '';
        } else {
            toast({ variant: 'destructive', title: "Invalid Link", description: 'Please provide both a title and a URL.' });
        }
    };

    const handleRemoveLink = (index: number) => {
        const { links = [] } = formState;
        handleFieldChange('links', links.filter((_, i) => i !== index));
    };
    
    const handleAddWork = () => {
        const { workExperience = [] } = formState;
        const newWorkTitle = (document.getElementById('new-work-title') as HTMLInputElement)?.value;
        const newWorkCompany = (document.getElementById('new-work-company') as HTMLInputElement)?.value;

        if (newWorkTitle?.trim() && newWorkCompany?.trim()) {
            handleFieldChange('workExperience', [...workExperience, { title: newWorkTitle, company: newWorkCompany }]);
            (document.getElementById('new-work-title') as HTMLInputElement).value = '';
            (document.getElementById('new-work-company') as HTMLInputElement).value = '';
        } else {
            toast({ variant: 'destructive', title: "Invalid Work Entry", description: 'Please provide both a title and a company.' });
        }
    };

    const handleRemoveWork = (index: number) => {
        const { workExperience = [] } = formState;
        handleFieldChange('workExperience', workExperience.filter((_, i) => i !== index));
    };

    const handleAddEdu = () => {
        const { education = [] } = formState;
        const newEduSchool = (document.getElementById('new-edu-school') as HTMLInputElement)?.value;
        const newEduDegree = (document.getElementById('new-edu-degree') as HTMLInputElement)?.value;

        if (newEduSchool?.trim() && newEduDegree?.trim()) {
            handleFieldChange('education', [...education, { school: newEduSchool, degree: newEduDegree }]);
            (document.getElementById('new-edu-school') as HTMLInputElement).value = '';
            (document.getElementById('new-edu-degree') as HTMLInputElement).value = '';
        } else {
            toast({ variant: 'destructive', title: "Invalid Education Entry", description: 'Please provide both a school and a degree.' });
        }
    };

    const handleRemoveEdu = (index: number) => {
        const { education = [] } = formState;
        handleFieldChange('education', education.filter((_, i) => i !== index));
    };


    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        if (!formState.name?.trim()) {
             toast({ variant: "destructive", title: "Name is required", description: "The name field cannot be empty." });
            return;
        }

        const updatePayload: Partial<User> = {};

        // Compare each field and add to payload only if it has changed
        Object.keys(formState).forEach(key => {
            const formValue = (formState as any)[key];
            const initialValue = (initialState as any)[key];

            if (JSON.stringify(formValue) !== JSON.stringify(initialValue)) {
                (updatePayload as any)[key] = formValue;
            }
        });
        
        if (formState.dob && initialState.dob) {
            const formDate = new Date(formState.dob).getTime();
            const initialDate = new Date(initialState.dob).getTime();
            if(formDate !== initialDate) {
                 updatePayload.dob = formState.dob;
            }
        } else if (formState.dob) {
            updatePayload.dob = formState.dob;
        }


        const filesToUpload: { avatar?: File, cv?: File } = {};
        if (avatarFile) filesToUpload.avatar = avatarFile;
        if (cvFile) filesToUpload.cv = cvFile;
        
        if (Object.keys(updatePayload).length === 0 && Object.keys(filesToUpload).length === 0) {
            toast({ description: "No changes to save." });
            return;
        }


        startTransition(async () => {
            try {
                await updateUserProfile(updatePayload, filesToUpload);
                
                const newInitialState = { ...initialState, ...updatePayload };
                if (filesToUpload.cv) {
                    newInitialState.cvFileName = filesToUpload.cv.name;
                }
                setInitialState(newInitialState);
                
                setAvatarFile(null);
                setAvatarPreview(newInitialState.avatar || null);
                setCvFile(null);
                toast({ title: "Success!", description: "Your profile information has been updated successfully." });
            } catch (error: any) {
                console.error("Failed to update profile:", error);
                const description = error.message.includes('bytes') ? "An image or file size is too large." : "Failed to update profile. Please try again.";
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
                <input type="file" ref={cvFileInputRef} onChange={handleCvFileSelect} className="hidden" accept=".pdf,.doc,.docx" />
                
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24 text-4xl">
                            <AvatarImage src={avatarPreview || currentUser?.avatar || undefined} alt={formState.name} />
                            <AvatarFallback>{formState.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 border-2 border-card" onClick={() => avatarFileInputRef.current?.click()}>
                            <Camera className="w-4 h-4"/><span className="sr-only">Change Picture</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{formState.name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formState.name} onChange={(e) => handleFieldChange('name', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="bio">About Me (Professional Summary)</Label><Textarea id="bio" placeholder="Write something about yourself..." value={formState.bio} onChange={(e) => handleFieldChange('bio', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={currentUser.email} disabled /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formState.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} placeholder="e.g., +1234567890" /></div>
                    <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formState.dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formState.dob ? format(new Date(formState.dob), "PPP", { locale: enUS }) : <span>Pick your date of birth</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formState.dob ? new Date(formState.dob) : undefined} onSelect={(date) => handleFieldChange('dob', date)} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} /></PopoverContent></Popover></div>
                </div>

                <Separator />
                
                <div className="space-y-6">
                    <DetailSection title="CV & Portfolio" icon={Briefcase}>
                        <div className="space-y-4">
                            <Button variant="outline" className="w-full justify-start p-3" onClick={() => cvFileInputRef.current?.click()}>
                                <FileUp className="mr-2 h-4 w-4" />
                                {cvFile ? cvFile.name : (formState.cvFileName ? `Replace: ${formState.cvFileName}` : 'Upload CV')}
                            </Button>
                            
                            <div className="space-y-2">
                                <Label>External Links (Portfolio, LinkedIn, etc.)</Label>
                                {formState.links?.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={link.title} disabled className="bg-muted" />
                                        <Input value={link.url} disabled className="bg-muted"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <Input id="new-link-title" placeholder="Link Title (e.g., Portfolio)" />
                                    <Input id="new-link-url" placeholder="https://..." />
                                    <Button variant="ghost" size="icon" onClick={handleAddLink}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                                </div>
                            </div>
                        </div>
                    </DetailSection>

                    <DetailSection title="Work Experience" icon={Briefcase}>
                         <div className="space-y-2">
                            {formState.workExperience?.map((work, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{work.title}</span> at {work.company}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWork(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input id="new-work-title" placeholder="Job Title" />
                                <Input id="new-work-company" placeholder="Company Name" />
                                <Button variant="ghost" size="icon" onClick={handleAddWork}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Education" icon={GraduationCap}>
                        <div className="space-y-2">
                            {formState.education?.map((edu, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{edu.degree}</span> from {edu.school}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEdu(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input id="new-edu-school" placeholder="School/University" />
                                <Input id="new-edu-degree" placeholder="Degree/Certificate" />
                                <Button variant="ghost" size="icon" onClick={handleAddEdu}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Current City" icon={Home}><Input id="city" value={formState.city} onChange={(e) => handleFieldChange('city', e.target.value)} placeholder="e.g., Dubai" /></DetailSection>
                    <DetailSection title="Hometown" icon={MapPin}><Input id="from" value={formState.from} onChange={(e) => handleFieldChange('from', e.target.value)} placeholder="e.g., Riyadh" /></DetailSection>
                    <DetailSection title="Relationship" icon={Heart}><Input id="relationship" value={formState.relationshipStatus} onChange={(e) => handleFieldChange('relationshipStatus', e.target.value)} placeholder="e.g., Single, Married..." /></DetailSection>
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

export default ProfileSettings;
