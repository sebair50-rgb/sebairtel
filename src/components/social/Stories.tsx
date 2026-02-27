
"use client";

import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';
import { useTranslation } from '@/store/LanguageContext';
import Image from 'next/image';

const Stories = () => {
    const { users, currentUser } = useAppContext();
    const { t } = useTranslation();

    // In production, these would be fetched from a 'stories' collection in Firestore
    const mockStories = users.slice(0, 10).map((user, i) => ({
        id: `story-${i}`,
        user,
        image: `https://picsum.photos/seed/story-${i}/300/500`
    }));

    return (
        <div className="w-full bg-white dark:bg-black/20 mb-4 overflow-hidden py-4 border-y md:border-none md:rounded-xl">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2.5 px-4">
                    {/* Create Story */}
                    <div className="relative w-[110px] h-[190px] shrink-0 rounded-xl overflow-hidden border shadow-sm group cursor-pointer">
                        <div className="h-[135px] relative">
                            <Image 
                                src={currentUser?.avatar || 'https://placehold.co/100x100.png'} 
                                layout="fill" 
                                objectFit="cover" 
                                alt="Me" 
                                className="group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[55px] bg-white dark:bg-slate-900 flex flex-col items-center justify-end pb-2">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-1 border-4 border-white dark:border-slate-900">
                                <Plus size={20} className="text-white" />
                            </div>
                            <span className="text-[11px] font-bold">Create story</span>
                        </div>
                    </div>

                    {/* Other Stories */}
                    {mockStories.length > 0 ? (
                        mockStories.map((story) => (
                            <div key={story.id} className="relative w-[110px] h-[190px] shrink-0 rounded-xl overflow-hidden shadow-sm group cursor-pointer">
                                <Image 
                                    src={story.image} 
                                    layout="fill" 
                                    objectFit="cover" 
                                    alt={story.user.name} 
                                    className="group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-2 left-2 ring-4 ring-blue-600 rounded-full">
                                    <Avatar className="h-8 w-8 border-2 border-white">
                                        <AvatarImage src={story.user.avatar} />
                                        <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-white text-[11px] font-bold truncate leading-tight">
                                        {story.user.name}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Placeholder for no stories
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-[110px] h-[190px] shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border" />
                        ))
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export default Stories;
