
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Send, X, Code, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const CreatePostCard = () => {
  const { addPost, updatePost, currentUser, editingPost, cancelEditPost } = useAppContext();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isEditing = !!editingPost;

  useEffect(() => {
    if (editingPost) {
        setContent(editingPost.content);
        const isCodePost = editingPost.mediaType === 'code' || (editingPost.content.includes('```') && !editingPost.mediaSrc);
        setIsCodeMode(isCodePost);
        if (!isCodePost && editingPost.mediaSrc && editingPost.mediaType) {
            setMedia({ type: editingPost.mediaType as 'image' | 'video', src: editingPost.mediaSrc });
        } else {
            setMedia(null);
        }
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } else {
        setContent('');
        setMedia(null);
        setIsCodeMode(false);
    }
  }, [editingPost]);


  const handlePost = async () => {
    if (!content.trim() && !media) {
        toast({
            variant: "destructive",
            title: "Post is empty",
            description: "Please write something or add media to your post.",
        });
        return
    };

    let postData: any = { content };
    if (isCodeMode) {
        postData.mediaType = 'code';
    } else if (media) {
        postData.mediaType = media.type;
        postData.mediaSrc = media.src;
    }

    if (isEditing && editingPost) {
        await updatePost(editingPost.id, postData);
        toast({ description: "Post updated successfully." });
    } else {
        await addPost(postData);
    }
    
    cancelEditPost();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) { // 1MB limit
        toast({
            variant: "destructive",
            title: "File size is too large",
            description: "Please choose a file smaller than 1MB.",
        });
        return;
      }
      const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : null);
      if (!fileType) {
        toast({
            variant: "destructive",
            title: "Unsupported file type",
            description: "Please choose an image or video file.",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileDataUrl = event.target?.result as string;
        setMedia({ type: fileType, src: fileDataUrl });
        setIsCodeMode(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!currentUser) return null;

  return (
    <Card ref={cardRef} className={cn("overflow-hidden", isEditing ? 'ring-2 ring-primary border-primary' : '')}>
      <CardContent className="p-4 space-y-3">
        {isEditing && (
            <div className="text-sm font-semibold text-primary px-2">Editing post...</div>
        )}
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder={`What's on your mind, ${currentUser.name}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-offset-0 text-base min-h-[80px]"
          />
        </div>
        {media && (
            <div className="ml-14 relative w-full max-w-md rounded-lg overflow-hidden border">
                {media.type === 'image' ? (
                     <Image src={media.src} alt="Preview" width={400} height={400} className="object-cover w-full h-auto"/>
                ) : (
                    <video src={media.src} controls className="w-full" />
                )}
                 <Button variant="destructive" size="icon" onClick={() => setMedia(null)} className="absolute top-2 right-2 h-7 w-7">
                    <X size={16} />
                </Button>
            </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
            {isEditing && (
                <Button variant="outline" onClick={cancelEditPost}>Cancel</Button>
            )}
            <Button onClick={handlePost} disabled={(!content.trim() && !media)} className="w-full">
                {isEditing ? 'Update Post' : 'Post'}
            </Button>
        </div>
        </CardContent>
        <Separator/>
         <div className="p-1 flex justify-around items-center">
            <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />
            <Button variant="ghost" className="text-muted-foreground w-full flex-1" onClick={() => toast({description: "Coming soon!"})}>
                <Video className="text-red-500" />
                <span className="ml-2 hidden sm:inline">Live Video</span>
            </Button>
            <Button variant="ghost" className="text-muted-foreground w-full flex-1" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="text-green-500" />
                <span className="ml-2 hidden sm:inline">Photo/Video</span>
            </Button>
            <Button variant="ghost" className="text-muted-foreground w-full flex-1" onClick={() => toast({description: "Coming soon!"})}>
                <Code className="text-blue-500" />
                <span className="ml-2 hidden sm:inline">Code</span>
            </Button>
         </div>
    </Card>
  );
};

export default CreatePostCard;
