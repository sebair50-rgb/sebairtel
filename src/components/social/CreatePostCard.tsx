
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Send, X, Code } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
        // Scroll to the top to make the editing card visible
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } else {
        // Reset form when not editing
        setContent('');
        setMedia(null);
        setIsCodeMode(false);
    }
  }, [editingPost]);


  const handlePost = async () => {
    if (!content.trim()) return;

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

  const toggleCodeMode = () => {
      setIsCodeMode(!isCodeMode);
      setMedia(null);
  }
  
  if (!currentUser) return null;

  return (
    <Card ref={cardRef} className={isEditing ? 'ring-2 ring-primary border-primary' : ''}>
      <CardContent className="p-4 space-y-4">
        {isEditing && (
            <div className="text-sm font-semibold text-primary">Editing post...</div>
        )}
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder={isCodeMode ? "Share your code snippet..." : "What's on your mind, my friend?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn(
                "flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-offset-0",
                isCodeMode && "font-code text-sm"
            )}
            dir={isCodeMode ? "ltr" : undefined}
          />
        </div>
        {media && (
            <div className="ml-16 relative w-full max-w-sm">
                {media.type === 'image' ? (
                     <Image src={media.src} alt="Preview" width={400} height={400} className="rounded-lg object-cover w-full h-auto"/>
                ) : (
                    <video src={media.src} controls className="rounded-lg w-full" />
                )}
                 <button onClick={() => setMedia(null)} className="absolute -top-2 -right-2 bg-background rounded-full p-0.5 border">
                    <X size={16} />
                </button>
            </div>
        )}
        <div className="flex justify-between items-center ml-16">
          <div className="flex items-center gap-1">
             <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isCodeMode}>
                <ImageIcon className={cn("text-primary", isCodeMode && "text-muted-foreground")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleCodeMode}>
                <Code className={cn(isCodeMode && "text-primary")} />
            </Button>
          </div>
          <div className="flex gap-2">
            {isEditing && (
                 <Button variant="outline" onClick={cancelEditPost}>Cancel</Button>
            )}
            <Button onClick={handlePost} disabled={!content.trim()}>
                <Send className="mr-2" />
                {isEditing ? 'Update' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;
