
"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, Calendar as CalendarIcon, Phone, Briefcase, GraduationCap, Home, MapPin, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';

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

const AddButton = ({ label }: { label: string }) => {
    const { toast } = useToast();
    return (
        <Button variant="outline" className="w-full justify-start p-3 bg-muted/50" onClick={() => toast({ description: 'This feature will be activated soon.' })}>
            {label}
        </Button>
    )
};


const ProfileSettings = () => {
    const { currentUser, updateUserProfile } = useAppContext();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [dob, setDob] = useState<Date | undefined>(currentUser?.dob ? new Date(currentUser.dob) : undefined);
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [city, setCity] = useState(currentUser?.city || '');
    const [from, setFrom] = useState(currentUser?.from || '');
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
                    title: "Image size is too large",
                    description: "Please choose an image smaller than 1MB.",
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

        if (name.trim() && name.trim() !== currentUser.name) updatePayload.name = name.trim();
        if (phone.trim() !== (currentUser.phone || '')) updatePayload.phone = phone.trim();
        const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
        if (formattedDob !== currentUser.dob) updatePayload.dob = formattedDob;
        if (bio.trim() !== (currentUser.bio || '')) updatePayload.bio = bio.trim();
        if (city.trim() !== (currentUser.city || '')) updatePayload.city = city.trim();
        if (from.trim() !== (currentUser.from || '')) updatePayload.from = from.trim();
        
        if (avatarPreview && avatarFile) {
            updatePayload.avatar = avatarPreview;
        }

        if (Object.keys(updatePayload).length === 0) {
            toast({ description: "No changes to save." });
            return;
        }

        if (updatePayload.name === '') {
             toast({
                variant: "destructive",
                title: "Name is required",
                description: "The name field cannot be empty.",
            });
            return;
        }

        startTransition(async () => {
            try {
                await updateUserProfile(updatePayload);
                setAvatarPreview(null);
                setAvatarFile(null);
                toast({
                    title: "Success!",
                    description: "Your profile information has been updated successfully.",
                });
            } catch (error: any) {
                console.error("Failed to update profile:", error);
                const description = error.message.includes('bytes')
                    ? "The image size is too large. Please choose a smaller image."
                    : "Failed to update profile. Please try again.";

                toast({
                    variant: "destructive",
                    title: "An error occurred",
                    description,
                });
            }
        });
    };

    if (!currentUser) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader2 className="animate-spin" />
                        <span>Loading user data...</span>
                    </div>
                </CardContent>
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
      !!avatarFile;


    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is your public profile information.</CardDescription>
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
                          className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 border-2 border-card" 
                          onClick={() => fileInputRef.current?.click()}>
                            <Camera className="w-4 h-4"/>
                            <span className="sr-only">Change Picture</span>
                        </Button>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea id="bio" placeholder="Write something about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1234567890" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dob && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dob ? format(dob, "PPP", { locale: enUS }) : <span>Pick your date of birth</span>}
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

                <Separator />
                
                <div className="space-y-6">
                    <DetailSection title="Work" icon={Briefcase}>
                        <AddButton label="Add work information" />
                    </DetailSection>

                    <DetailSection title="Education Level" icon={GraduationCap}>
                        <div className="space-y-2">
                            <AddButton label="Add high school" />
                            <AddButton label="Add college" />
                        </div>
                    </DetailSection>
                    
                    <DetailSection title="Current City" icon={Home}>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Dubai" />
                    </DetailSection>

                    <DetailSection title="Hometown" icon={MapPin}>
                        <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g., Riyadh" />
                    </DetailSection>

                     <DetailSection title="Relationship" icon={Heart}>
                        <AddButton label="Add relationship status" />
                    </DetailSection>
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

    