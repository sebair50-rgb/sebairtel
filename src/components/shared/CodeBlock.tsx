
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

        const isHtml = language === 'html' || (language !== 'js' && /<[a-z][\s\S]*>/i.test(code));

        if (isHtml) {
            setRunMode('html');
        } else {
            setRunMode('js');
            const originalLog = console.log;
            let logs: string[] = [];
            // Override console.log to capture logs
            console.log = (...args) => {
                logs.push(args.map(arg => {
                    try {
                        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                    } catch (e) {
                        return 'Unserializable Object';
                    }
                }).join(' '));
            };
            
            try {
                // Use Function constructor to execute code safely
                new Function(code)();
                setOutput(logs.join('\n'));
            } catch (e: any) {
                setError(e.toString());
            } finally {
                // Restore original console.log
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
            // Optionally, show a toast or message for copy failure
        }
    }

    return (
        <div className="mt-2 rounded-lg bg-gray-900 text-white font-code text-left shadow-lg">
            <div className="flex justify-between items-center p-2 rounded-t-lg bg-gray-700/50">
                <span className="text-xs text-gray-400 select-none">{language || 'code'}</span>
                <div className="flex gap-2">
                    {isRunnable && (
                        <button onClick={runCode} className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
                            <Play size={14} /> Run
                        </button>
                    )}
                     <button onClick={copyCode} className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
                        {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            <pre className="p-4 text-sm whitespace-pre-wrap overflow-x-auto bg-gray-800/50"><code className={`language-${language}`}>{code}</code></pre>
            {runMode === 'js' && (output !== null || error !== null) && (
                <div className="border-t border-gray-700">
                    {output && <pre className="p-3 text-xs whitespace-pre-wrap text-white bg-black/20">{output || ' '}</pre>}
                    {error && <pre className="p-3 text-xs whitespace-pre-wrap text-red-400 bg-red-900/20">{error}</pre>}
                </div>
            )}
            {runMode === 'html' && (
                <iframe 
                    srcDoc={code} 
                    className="w-full h-64 border-t border-gray-700 bg-white" 
                    title="HTML Preview" 
                    sandbox="allow-scripts allow-same-origin"
                ></iframe>
            )}
        </div>
    );
  };
  
  export default CodeBlock;
