
"use client";

import React, { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { useAppContext } from '@/store/AppContext';

interface CodeBlockProps {
    code: string;
    language?: string;
    isRunnable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, isRunnable = true }) => {
    const { darkMode } = useAppContext();
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [runMode, setRunMode] = useState<'js' | 'html' | null>(null);

    const runCode = () => {
        setOutput(null);
        setError(null);
        setRunMode(null);

        const isHtml = /<[a-z][\s\S]*>/i.test(code);

        if (isHtml) {
            setRunMode('html');
        } else {
            setRunMode('js');
            const originalLog = console.log;
            let logs: string[] = [];
            console.log = (...args) => logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
            try {
                new Function(code)();
                setOutput(logs.join('\n'));
            } catch (e: any) {
                setError(e.toString());
            } finally {
                console.log = originalLog;
            }
        }
    };
    
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    }

    return (
        <div className="mt-2 rounded-lg bg-gray-800 text-white font-code text-left">
            <div className="flex justify-between items-center p-2 rounded-t-lg bg-gray-700/50">
                <div className="flex gap-2">
                    {isRunnable && (
                        <>
                            <button onClick={copyCode} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                                {isCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                            </button>
                            <button onClick={runCode} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                                <Play size={14} /> Run
                            </button>
                        </>
                    )}
                </div>
                <span className="text-xs text-gray-400">{language || 'code'}</span>
            </div>
            <pre className="p-3 text-sm whitespace-pre-wrap text-green-300"><code>{code}</code></pre>
            {runMode === 'js' && output !== null && <pre className="p-3 text-xs border-t border-gray-700 whitespace-pre-wrap text-white">{output || ' '}</pre>}
            {runMode === 'js' && error && <pre className="p-3 text-xs border-t border-gray-700 whitespace-pre-wrap text-red-400">{error}</pre>}
            {runMode === 'html' && <iframe srcDoc={code} className="w-full h-64 border-t border-gray-700 bg-white" title="HTML Preview" sandbox="allow-scripts allow-same-origin"></iframe>}
        </div>
    );
  };
  
  export default CodeBlock;
  
