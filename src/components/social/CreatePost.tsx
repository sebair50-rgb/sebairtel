
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, Smile, Loader2, X, Globe } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { useTranslation } from '@/store/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const CreatePost = () => {
    const { currentUser, addPost } = useAppContext();
    const { t } = useTranslation();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5242880) { // 5MB limit for production
                toast({ 
                    variant: 'destructive', 
                    title: t('createPost.fileTooLarge'), 
                    description: "Please choose a file smaller than 5MB." 
                });
                return;
            }
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !mediaFile) return;
        
        setIsPosting(true);
        try {
            const mediaType = mediaFile?.type.startsWith('video') ? 'video' : 'image';
            
            await addPost({ 
                content, 
                mediaType: mediaFile ? mediaType : 'text', 
                mediaFile: mediaFile || undefined 
            });
            
            setContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setIsOpen(false);
            toast({ title: t('createPost.updateSuccess') });
        } catch (error: any) {
            console.error("Post failed", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <Card className="w-full shadow-sm md:rounded-xl mb-4 border-none md:border">
            <CardContent className="p-4 space-y-3">
                <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="flex-1 justify-start rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground font-normal hover:bg-slate-200 border-none h-10 px-4"
                            >
                                {t('createPost.placeholder')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="text-center">{t('createPost.post')}</DialogTitle>
                            </DialogHeader>
                            <div className="flex gap-2 items-center py-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-sm">{currentUser?.name}</p>
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-xs flex items-center gap-1 w-fit">
                                        <Globe size={10} /> <span>Public</span>
                                    </div>
                                </div>
                            </div>
                            <Textarea 
                                placeholder={t('createPost.placeholder')}
                                className="min-h-[150px] text-lg border-none focus-visible:ring-0 resize-none p-0"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            {mediaPreview && (
                                <div className="relative rounded-lg overflow-hidden border">
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                                        onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                    >
                                        <X size={16} />
                                    </Button>
                                    <img src={mediaPreview} className="w-full object-contain max-h-[300px]" alt="Preview" />
                                </div>
                            )}
                            <div className="flex items-center justify-between border rounded-lg p-3">
                                <p className="font-semibold text-sm">Add to your post</p>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-green-500 rounded-full h-9 w-9"><ImageIcon /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-blue-500 rounded-full h-9 w-9"><Video /></Button>
                                    <Button variant="ghost" size="icon" className="text-yellow-500 rounded-full h-9 w-9"><Smile /></Button>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                            <Button className="w-full font-bold" disabled={isPosting || (!content.trim() && !mediaFile)} onClick={handlePost}>
                                {isPosting ? <Loader2 className="animate-spin" /> : t('createPost.post')}
                            </Button>
                        </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 shrink-0" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon size={24} className="text-green-500" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CreatePost;
