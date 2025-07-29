
"use client";

import React from 'react';
import CodeBlock from '../chat/CodeBlock';
import { Card } from '../ui/card';

interface CodeResponseProps {
    response: string;
}

const CodeResponse: React.FC<CodeResponseProps> = ({ response }) => {
    // Regex to split the text by code blocks, keeping the delimiters
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = response.split(codeBlockRegex);

    return (
        <div className="space-y-4 text-sm w-full">
            {parts.map((part, index) => {
                if (part.match(codeBlockRegex)) {
                    // This part is a code block
                    return <CodeBlock key={index} code={part} />;
                } else {
                    // This part is regular text
                    if (!part.trim()) return null; // Don't render empty strings
                    return (
                        <Card key={index} className="p-4 bg-background border shadow-sm">
                           <pre className="whitespace-pre-wrap font-body">{part.trim()}</pre>
                        </Card>
                    )
                }
            })}
        </div>
    );
};

export default CodeResponse;
