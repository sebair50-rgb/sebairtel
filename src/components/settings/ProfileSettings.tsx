
"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
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
import type { User, WorkExperience, Education } from '@/lib/types';

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
    
    // Form state
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [dob, setDob] = useState<Date | undefined>(currentUser?.dob ? new Date(currentUser.dob) : undefined);
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [city, setCity] = useState(currentUser?.city || '');
    const [from, setFrom] = useState(currentUser?.from || '');
    const [relationshipStatus, setRelationshipStatus] = useState(currentUser?.relationshipStatus || '');
    
    // Complex state
    const [workExperience, setWorkExperience] = useState<WorkExperience[]>(currentUser?.workExperience || []);
    const [education, setEducation] = useState<Education[]>(currentUser?.education || []);
    const [links, setLinks] = useState(currentUser?.links || []);
    
    // Temporary state for new entries
    const [newWork, setNewWork] = useState({ title: '', company: '' });
    const [newEdu, setNewEdu] = useState({ school: '', degree: '' });
    const [newLink, setNewLink] = useState({ title: '', url: '' });

    // CV and Links state
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvFileName, setCvFileName] = useState(currentUser?.cvFileName || '');

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [isPending, startTransition] = useTransition();

     useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            setDob(currentUser.dob ? new Date(currentUser.dob) : undefined);
            setBio(currentUser.bio || '');
            setCity(currentUser.city || '');
            setFrom(currentUser.from || '');
            setCvFileName(currentUser.cvFileName || '');
            setLinks(currentUser.links || []);
            setWorkExperience(currentUser.workExperience || []);
            setEducation(currentUser.education || []);
            setRelationshipStatus(currentUser.relationshipStatus || '');

            setAvatarPreview(null);
            setAvatarFile(null);
            setCvFile(null);
        }
    }, [currentUser]);


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
            setCvFileName(file.name);
        }
    };
    
    const handleAddLink = () => {
        if (newLink.title.trim() && newLink.url.trim()) {
            setLinks([...links, newLink]);
            setNewLink({ title: '', url: '' });
        } else {
            toast({ variant: 'destructive', title: "Invalid Link", description: 'Please provide both a title and a URL.' });
        }
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleAddWork = () => {
        if (newWork.title.trim() && newWork.company.trim()) {
            setWorkExperience([...workExperience, newWork]);
            setNewWork({ title: '', company: '' });
        } else {
            toast({ variant: 'destructive', title: "Invalid Work Entry", description: 'Please provide both a title and a company.' });
        }
    };

    const handleRemoveWork = (index: number) => {
        setWorkExperience(workExperience.filter((_, i) => i !== index));
    };

    const handleAddEdu = () => {
        if (newEdu.school.trim() && newEdu.degree.trim()) {
            setEducation([...education, newEdu]);
            setNewEdu({ school: '', degree: '' });
        } else {
            toast({ variant: 'destructive', title: "Invalid Education Entry", description: 'Please provide both a school and a degree.' });
        }
    };

    const handleRemoveEdu = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        const updatePayload: Partial<Omit<User, 'id'>> = {};

        if (name.trim() && name.trim() !== currentUser.name) updatePayload.name = name.trim();
        if (phone.trim() !== (currentUser.phone || '')) updatePayload.phone = phone.trim();
        const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
        if (formattedDob !== currentUser.dob) updatePayload.dob = formattedDob;
        if (bio.trim() !== (currentUser.bio || '')) updatePayload.bio = bio.trim();
        if (city.trim() !== (currentUser.city || '')) updatePayload.city = city.trim();
        if (from.trim() !== (currentUser.from || '')) updatePayload.from = from.trim();
        if (relationshipStatus.trim() !== (currentUser.relationshipStatus || '')) updatePayload.relationshipStatus = relationshipStatus.trim();
        if (JSON.stringify(links) !== JSON.stringify(currentUser.links || [])) updatePayload.links = links;
        if (JSON.stringify(workExperience) !== JSON.stringify(currentUser.workExperience || [])) updatePayload.workExperience = workExperience;
        if (JSON.stringify(education) !== JSON.stringify(currentUser.education || [])) updatePayload.education = education;
        
        const filesToUpload: { avatar?: File, cv?: File } = {};
        if (avatarFile) filesToUpload.avatar = avatarFile;
        if (cvFile) {
            filesToUpload.cv = cvFile;
            updatePayload.cvFileName = cvFileName;
        }
        
        if (Object.keys(updatePayload).length === 0 && Object.keys(filesToUpload).length === 0) {
            toast({ description: "No changes to save." });
            return;
        }

        if (updatePayload.name === '') {
             toast({ variant: "destructive", title: "Name is required", description: "The name field cannot be empty." });
            return;
        }

        startTransition(async () => {
            try {
                await updateUserProfile(updatePayload, filesToUpload);
                setAvatarPreview(null);
                setAvatarFile(null);
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
    
    const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
    const hasChanges =
      (name.trim() !== (currentUser.name || '') && name.trim() !== "") ||
      (phone.trim() !== (currentUser.phone || '')) ||
      (formattedDob !== (currentUser.dob || undefined)) ||
      (bio.trim() !== (currentUser.bio || '')) ||
      (city.trim() !== (currentUser.city || '')) ||
      (from.trim() !== (currentUser.from || '')) ||
      (relationshipStatus.trim() !== (currentUser.relationshipStatus || '')) ||
      JSON.stringify(links) !== JSON.stringify(currentUser.links || []) ||
      JSON.stringify(workExperience) !== JSON.stringify(currentUser.workExperience || []) ||
      JSON.stringify(education) !== JSON.stringify(currentUser.education || []) ||
      !!avatarFile || !!cvFile;


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
                            <AvatarImage src={avatarPreview || currentUser?.avatar || undefined} alt={name} />
                            <AvatarFallback>{name.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 border-2 border-card" onClick={() => avatarFileInputRef.current?.click()}>
                            <Camera className="w-4 h-4"/><span className="sr-only">Change Picture</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="bio">About Me (Professional Summary)</Label><Textarea id="bio" placeholder="Write something about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={currentUser.email} disabled /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1234567890" /></div>
                    <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dob ? format(dob, "PPP", { locale: enUS }) : <span>Pick your date of birth</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dob} onSelect={setDob} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} /></PopoverContent></Popover></div>
                </div>

                <Separator />
                
                <div className="space-y-6">
                    <DetailSection title="CV & Portfolio" icon={Briefcase}>
                        <div className="space-y-4">
                            <Button variant="outline" className="w-full justify-start p-3" onClick={() => cvFileInputRef.current?.click()}>
                                <FileUp className="mr-2 h-4 w-4" />
                                {cvFileName ? `Replace: ${cvFileName}` : 'Upload CV'}
                            </Button>
                            
                            <div className="space-y-2">
                                <Label>External Links (Portfolio, LinkedIn, etc.)</Label>
                                {links.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={link.title} disabled className="bg-muted" />
                                        <Input value={link.url} disabled className="bg-muted"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Link Title (e.g., Portfolio)" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} />
                                    <Input placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} />
                                    <Button variant="ghost" size="icon" onClick={handleAddLink}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                                </div>
                            </div>
                        </div>
                    </DetailSection>

                    <DetailSection title="Work Experience" icon={Briefcase}>
                         <div className="space-y-2">
                            {workExperience.map((work, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{work.title}</span> at {work.company}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWork(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input placeholder="Job Title" value={newWork.title} onChange={e => setNewWork({...newWork, title: e.target.value})} />
                                <Input placeholder="Company Name" value={newWork.company} onChange={e => setNewWork({...newWork, company: e.target.value})} />
                                <Button variant="ghost" size="icon" onClick={handleAddWork}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Education" icon={GraduationCap}>
                        <div className="space-y-2">
                            {education.map((edu, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <p className="flex-1 text-sm"><span className="font-semibold">{edu.degree}</span> from {edu.school}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEdu(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input placeholder="School/University" value={newEdu.school} onChange={e => setNewEdu({...newEdu, school: e.target.value})} />
                                <Input placeholder="Degree/Certificate" value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} />
                                <Button variant="ghost" size="icon" onClick={handleAddEdu}><PlusCircle className="w-5 h-5 text-primary"/></Button>
                            </div>
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Current City" icon={Home}><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Dubai" /></DetailSection>
                    <DetailSection title="Hometown" icon={MapPin}><Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g., Riyadh" /></DetailSection>
                    <DetailSection title="Relationship" icon={Heart}><Input id="relationship" value={relationshipStatus} onChange={(e) => setRelationshipStatus(e.target.value)} placeholder="e.g., Single, Married..." /></DetailSection>
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
