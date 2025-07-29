
"use client";

import React from 'react';
import type { Message } from '@/lib/types';
import CodeBlock from '@/components/shared/CodeBlock';
import { FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageContentProps {
  message: Message;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const renderTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:opacity-80">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/;
    const parts = message.text ? message.text.split(codeBlockRegex) : [];
    
    switch (message.type) {
        case 'image':
            return (
                <div>
                    <Image src={message.src!} alt={message.fileInfo?.name || 'Image'} width={300} height={200} className="rounded-lg max-w-full h-auto" />
                    {message.text && <p className="text-sm mt-2 whitespace-pre-wrap">{message.text}</p>}
                </div>
            );
        case 'video':
            return (
                <div>
                    <video src={message.src} controls className="rounded-lg max-w-full h-auto bg-black">
                        متصفحك لا يدعم عرض الفيديو.
                    </video>
                    {message.text && <p className="text-sm mt-2 whitespace-pre-wrap">{message.text}</p>}
                </div>
            );
        case 'file':
            return (
                <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-black/20")}>
                    <FileIcon size={32} className="flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{message.fileInfo?.name}</p>
                        <p className="text-xs opacity-80">{formatFileSize(message.fileInfo?.size)}</p>
                    </div>
                </div>
            );
        default: // text or code
            return (
                <div className="whitespace-pre-wrap break-words">
                  {parts.map((part, index) => {
                    if (index % 3 === 2) { // This is the code content
                      const lang = parts[index-1] || 'js';
                      return <CodeBlock key={index} code={part} language={lang} />;
                    } else if (index % 3 === 0) { // This is regular text
                      return <span key={index}>{renderTextWithLinks(part)}</span>;
                    }
                    return null; // This is the language part, handled above
                  })}
                </div>
              );
    }
};

export default MessageContent;
