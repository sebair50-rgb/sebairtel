
"use client";

import React from 'react';
import type { Message } from '@/lib/types';
import { FileIcon, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import CodeBlock from '../shared/CodeBlock';

interface MessageContentProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ message, isOwnMessage }) => {
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
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:opacity-80">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

     const containsCodeBlock = (text?: string) => {
        if (!text) return false;
        return /```(\w+)?\n([\s\S]+?)```/.test(text);
    }

    switch (message.type) {
        case 'image':
            return (
                <div className="space-y-1">
                    {message.src && (
                      <Image 
                        src={message.src} 
                        alt={message.fileInfo?.name || 'Image'} 
                        width={300} 
                        height={200} 
                        className="rounded-lg max-w-full h-auto bg-black/10" 
                      />
                    )}
                    {message.text && <p className="text-sm whitespace-pre-wrap">{renderTextWithLinks(message.text)}</p>}
                </div>
            );
        case 'video':
            return (
                <div className="space-y-1">
                    <video src={message.src} controls className="rounded-lg max-w-full h-auto bg-black">
                        متصفحك لا يدعم عرض الفيديو.
                    </video>
                    {message.text && <p className="text-sm mt-1 whitespace-pre-wrap">{renderTextWithLinks(message.text)}</p>}
                </div>
            );
        case 'audio':
            return (
                <div className={cn("flex items-center gap-2", isOwnMessage ? "w-48 md:w-64" : "w-48 md:w-64")}>
                    <Music2 className="text-primary flex-shrink-0" />
                    <audio src={message.src} controls className="w-full h-10" />
                </div>
            );
        case 'file':
            return (
                <div className={cn("flex items-center gap-3 p-3 rounded-lg", isOwnMessage ? "bg-black/10" : "bg-black/5")}>
                    <FileIcon size={32} className="flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{message.fileInfo?.name}</p>
                        <p className="text-xs opacity-80">{formatFileSize(message.fileInfo?.size)}</p>
                    </div>
                </div>
            );
         case 'code':
            const codeMatch = message.text?.match(/```(\w+)?\n([\s\S]+?)```/);
            if (codeMatch) {
                 const lang = codeMatch[1] || 'js';
                 const code = codeMatch[2];
                 return <CodeBlock code={code} language={lang} />;
            }
             return <div className="whitespace-pre-wrap break-words text-left font-code">{message.text ? renderTextWithLinks(message.text) : null}</div>;
        default: // text
             if (containsCodeBlock(message.text)) {
                const parts = message.text!.split(/(```(?:\w+)?\n(?:[\s\S]+?)```)/);
                return (
                     <div className="whitespace-pre-wrap break-words">
                        {parts.map((part, index) => {
                            if (containsCodeBlock(part)) {
                                const codeMatch = part.match(/```(\w+)?\n([\s\S]+?)```/);
                                if (codeMatch) {
                                    const lang = codeMatch[1] || 'js';
                                    const code = codeMatch[2];
                                    return <CodeBlock key={index} code={code} language={lang} />;
                                }
                            }
                            return <span key={index}>{renderTextWithLinks(part)}</span>;
                        })}
                    </div>
                )
             }
             return <div className="whitespace-pre-wrap break-words">{message.text ? renderTextWithLinks(message.text) : null}</div>;
    }
};

export default MessageContent;
