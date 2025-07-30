"use client";

import React from 'react';
import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/AppContext';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { toast } = useToast();
  const { updatePost, currentUser, createNotification } = useAppContext();
  const [isSaved, setIsSaved] = React.useState(post.isSaved);
  const router = useRouter();

  if (!currentUser) return null;

  const isLiked = post.likedBy?.includes(currentUser.id) || false;

  const handleLike = () => {
      let newLikedBy = post.likedBy || [];
      const wasLiked = isLiked;

      if (wasLiked) {
          newLikedBy = newLikedBy.filter(id => id !== currentUser.id);
      } else {
          newLikedBy.push(currentUser.id);
          if (post.userId !== currentUser.id) {
            createNotification(post.userId, {
                type: 'like',
                message: `أعجب <strong>${currentUser.name}</strong> بمنشورك.`,
                fromUser: {id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar},
                link: `/post/${post.id}`
            })
          }
      }
      updatePost(post.id, { likedBy: newLikedBy });
  }

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({ description: !isSaved ? "تم حفظ المنشور!" : "تمت إزالة الحفظ!" });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post by ${post.user}!`);
    toast({ description: "تم نسخ رابط المشاركة!" });
  }
  
  const handleNavigateToProfile = () => {
      if(post.userId) {
          router.push(`/profile/${post.userId}`);
      }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleNavigateToProfile}>
            <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-bold">{post.user}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media && (
          <div className="mt-4 rounded-lg overflow-hidden border">
             <Image src={post.media.src} alt="Post media" width={600} height={400} className="w-full h-auto object-cover" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike}>
            <Heart size={18} className={cn(isLiked && 'fill-red-500 text-red-500')} />
            <span className="text-sm">{post.likedBy?.length || 0}</span>
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
