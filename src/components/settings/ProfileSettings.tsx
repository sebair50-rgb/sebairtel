
"use client";

import React, { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone, Briefcase, GraduationCap, Home, MapPin, Heart, FileUp, Link as LinkIcon, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import type { User, WorkExperience, Education, UserLink } from '@/lib/types';

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
    
    // This state holds the data that the component was initialized with.
    const [initialState, setInitialState] = useState<Partial<User>>({});

    // This state holds the current, mutable data of the form.
    const [formState, setFormState] = useState<Partial<User>>({});
    
    // States for file inputs
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);

    // State for temporary inputs for list items
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [newWork, setNewWork] = useState({ title: '', company: '' });
    const [newEdu, setNewEdu] = useState({ school: '', degree: '' });

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
                cvUrl: currentUser.cvUrl || '',
                cvFileName: currentUser.cvFileName || '',
                avatar: currentUser.avatar || '',
            };
            setInitialState(initialData);
            setFormState(initialData);
            setAvatarPreview(currentUser.avatar || null);
            setAvatarFile(null);
            setCvFile(null);
        }
    }, [currentUser]);
    
    const hasChanges = useMemo(() => {
        // Compare the live form state to the initial state
        const mainFormChanged = JSON.stringify(formState) !== JSON.stringify(initialState);
        
        // Check if there's text in any of the temporary input fields
        const newInputsHaveText = newLink.title.trim() !== '' || newLink.url.trim() !== '' ||
                                 newWork.title.trim() !== '' || newWork.company.trim() !== '' ||
                                 newEdu.school.trim() !== '' || newEdu.degree.trim() !== '';

        // Check if new files have been staged for upload
        const filesChanged = !!avatarFile || !!cvFile;

        return mainFormChanged || newInputsHaveText || filesChanged;
    }, [formState, initialState, avatarFile, cvFile, newLink, newWork, newEdu]);


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
        }
    };
    
    const handleRemoveCv = () => {
        setCvFile(null);
        handleFieldChange('cvUrl', '');
        handleFieldChange('cvFileName', '');
        if(cvFileInputRef.current) cvFileInputRef.current.value = "";
    };

    // Generic function to add an item to a list in the form state
    const addToList = <T extends UserLink | WorkExperience | Education>(
        field: 'links' | 'workExperience' | 'education', 
        newItem: T,
        resetNewItem: () => void,
        validation: () => boolean,
        errorToast: { title: string, description: string }
    ) => {
        if (validation()) {
            const currentList = (formState[field] as T[] | undefined) || [];
            handleFieldChange(field, [...currentList, newItem]);
            resetNewItem();
        } else {
            toast(errorToast);
        }
    };

    // Generic function to remove an item from a list
    const removeFromList = (field: 'links' | 'workExperience' | 'education', index: number) => {
        const currentList = (formState[field] as any[]) || [];
        handleFieldChange(field, currentList.filter((_, i) => i !== index));
    };

    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        let finalFormState = { ...formState };

        // Before saving, check if there are any un-added items in the temp fields and add them
        if (newLink.title.trim() && newLink.url.trim()) {
            finalFormState.links = [...(finalFormState.links || []), newLink];
            setNewLink({ title: '', url: '' });
        }
        if (newWork.title.trim() && newWork.company.trim()) {
            finalFormState.workExperience = [...(finalFormState.workExperience || []), newWork];
            setNewWork({ title: '', company: '' });
        }
        if (newEdu.school.trim() && newEdu.degree.trim()) {
            finalFormState.education = [...(finalFormState.education || []), newEdu];
            setNewEdu({ school: '', degree: '' });
        }

        // Now, construct the payload of only what changed
        let updatePayload: Partial<User> = {};
        (Object.keys(finalFormState) as Array<keyof typeof finalFormState>).forEach(key => {
            if (JSON.stringify(finalFormState[key]) !== JSON.stringify(initialState[key])) {
                (updatePayload as any)[key] = finalFormState[key];
            }
        });
        
        const filesToUpload: { avatar?: File, cv?: File } = {};
        if (avatarFile) filesToUpload.avatar = avatarFile;
        if (cvFile) filesToUpload.cv = cvFile;

        // If CV is being removed, we need to explicitly set the fields to empty strings
        if (initialState.cvUrl && !finalFormState.cvUrl) {
            updatePayload.cvUrl = '';
            updatePayload.cvFileName = '';
        }

        if (Object.keys(updatePayload).length === 0 && Object.keys(filesToUpload).length === 0) {
             toast({ description: "No changes to save." });
             return;
        }

        startTransition(async () => {
            try {
                await updateUserProfile(updatePayload, filesToUpload);
                toast({ title: "Success!", description: "Your profile has been updated." });
            } catch (error: any) {
                console.error("Failed to update profile:", error);
                const description = error.code === 'storage/retry-limit-exceeded' 
                    ? "Storage permission error. Please check rules."
                    : (error.message.includes('bytes') ? "An image or file size is too large." : "Failed to update profile.");
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
                            <AvatarImage src={avatarPreview || undefined} alt={formState.name} />
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
                    <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formState.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="bio">About Me (Professional Summary)</Label><Textarea id="bio" placeholder="Write something about yourself..." value={formState.bio || ''} onChange={(e) => handleFieldChange('bio', e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={currentUser.email || ''} disabled /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formState.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} placeholder="e.g., +1234567890" /></div>
                    <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formState.dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formState.dob ? format(new Date(formState.dob), "PPP", { locale: enUS }) : <span>Pick your date of birth</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formState.dob ? new Date(formState.dob) : undefined} onSelect={(date) => handleFieldChange('dob', date ? date.toISOString() : undefined)} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} /></PopoverContent></Popover></div>
                </div>

                <Separator />
                
                <div className="space-y-6">
                    <DetailSection title="CV & Portfolio" icon={Briefcase}>
                        <div className="space-y-4">
                            <div>
                                <Label>Curriculum Vitae (CV)</Label>
                                <div className="flex items-center gap-2 mt-2">
                                     <Button variant="outline" className="flex-1" onClick={() => cvFileInputRef.current?.click()}>
                                        <FileUp className="mr-2 h-4 w-4" />
                                        {cvFile ? cvFile.name : (formState.cvFileName ? "Replace CV" : "Upload CV")}
                                    </Button>
                                    {formState.cvUrl && !cvFile && (
                                        <Button variant="ghost" size="icon" onClick={handleRemoveCv}><XCircle className="text-destructive" /></Button>
                                    )}
                                </div>
                                {formState.cvUrl && !cvFile && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Current file: <a href={formState.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{formState.cvFileName}</a>
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>External Links (Portfolio, LinkedIn, etc.)</Label>
                                {formState.links?.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={link.title} disabled className="bg-muted" />
                                        <Input value={link.url} disabled className="bg-muted"/>
                                        <Button variant="ghost" size="icon" onClick={() => removeFromList('links', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <Input value={newLink.title} onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))} placeholder="Link Title (e.g., Portfolio)" />
                                    <Input value={newLink.url} onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
                                    <Button variant="ghost" size="icon" onClick={() => addToList('links', newLink, () => setNewLink({title:'', url:''}), () => !!(newLink.title && newLink.url), {variant: 'destructive', title: "Invalid Link", description: "Please provide both a title and a URL."})}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                                </div>
                            </div>
                        </div>
                    </DetailSection>

                    <DetailSection title="Work Experience" icon={Briefcase}>
                         <div className="space-y-2">
                            {formState.workExperience?.map((work, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{work.title}</span> at {work.company}</p>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromList('workExperience', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input value={newWork.title} onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))} placeholder="Job Title" />
                                <Input value={newWork.company} onChange={(e) => setNewWork(prev => ({ ...prev, company: e.target.value }))} placeholder="Company Name" />
                                <Button variant="ghost" size="icon" onClick={() => addToList('workExperience', newWork, () => setNewWork({title:'', company:''}), () => !!(newWork.title && newWork.company), {variant: 'destructive', title: "Invalid Work Entry", description: "Please provide both a job title and company."})}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Education" icon={GraduationCap}>
                        <div className="space-y-2">
                            {formState.education?.map((edu, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{edu.degree}</span> from {edu.school}</p>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromList('education', index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input value={newEdu.school} onChange={(e) => setNewEdu(prev => ({ ...prev, school: e.target.value }))} placeholder="School/University" />
                                <Input value={newEdu.degree} onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))} placeholder="Degree/Certificate" />
                                <Button variant="ghost" size="icon" onClick={() => addToList('education', newEdu, () => setNewEdu({school:'', degree:''}), () => !!(newEdu.school && newEdu.degree), {variant: 'destructive', title: "Invalid Education Entry", description: "Please provide both a school and a degree."})}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
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

export default ProfileSettings;
