
"use client";

import React from 'react';
import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { toast } = useToast();
  const { updatePost } = useAppContext();
  const [isLiked, setIsLiked] = React.useState(post.isLiked);
  const [isSaved, setIsSaved] = React.useState(post.isSaved);

  const handleLike = () => {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      const newLikesCount = newLikedState ? post.likes + 1 : post.likes -1;
      updatePost(post.id, { likes: newLikesCount });
  }

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, you'd also update the backend here
    toast({ description: !isSaved ? "تم حفظ المنشور!" : "تمت إزالة الحفظ!" });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post by ${post.user}!`);
    toast({ description: "تم نسخ رابط المشاركة!" });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarFallback>{post.avatar}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold">{post.user}</p>
          <p className="text-xs text-muted-foreground">{post.time}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media && (
          <div className="mt-4 rounded-lg overflow-hidden border">
             <Image src={post.media.src} alt="Post media" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="social media" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike}>
            <Heart size={18} className={cn(isLiked && 'fill-red-500 text-red-500')} />
            <span className="text-sm">{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments.length}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleShare}>
              <Share2 size={18} />
          </Button>

        </div>
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Bookmark size={18} className={cn(isSaved && 'fill-primary text-primary')} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
