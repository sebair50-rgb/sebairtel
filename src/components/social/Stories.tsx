"use client";

import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';

const Stories = () => {
    const { currentUser } = useAppContext();

    return (
        <div className="w-full bg-white dark:bg-black/20 mb-4 overflow-hidden py-4 border-y md:border-none md:rounded-xl">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2.5 px-4">
                    <div className="relative w-[110px] h-[190px] shrink-0 rounded-xl overflow-hidden border shadow-sm group cursor-pointer bg-muted">
                        <div className="h-[135px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || 'Current user'} />
                                <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[55px] bg-white dark:bg-slate-900 flex flex-col items-center justify-end pb-2">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-1 border-4 border-white dark:border-slate-900">
                                <Plus size={20} className="text-white" />
                            </div>
                            <span className="text-[11px] font-bold">Create story</span>
                        </div>
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export default Stories;
