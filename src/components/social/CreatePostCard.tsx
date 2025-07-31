
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Send, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

const CreatePostCard = () => {
  const { addPost, currentUser } = useAppContext();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!content.trim() && !media) return;
    addPost({ content, media });
    setContent('');
    setMedia(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileDataUrl = event.target?.result as string;
        setMedia({ type: 'image', src: fileDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!currentUser) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="بماذا تفكر يا صديقي؟"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </div>
        {media && (
            <div className="ml-16 relative w-32 h-32">
                <Image src={media.src} alt="Preview" layout="fill" className="rounded-lg object-cover"/>
                 <button onClick={() => setMedia(null)} className="absolute -top-2 -right-2 bg-background rounded-full p-0.5 border">
                    <X size={16} />
                </button>
            </div>
        )}
        <div className="flex justify-between items-center ml-16">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="text-primary" />
          </Button>
          <Button onClick={handlePost} disabled={!content.trim() && !media}>
            <Send className="ml-2" />
            نشر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;
