
"use client";
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, BrainCircuit, Bug, Zap, Play, Terminal, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { processCode } from '@/ai/flows/code-flow';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
}

type AIAction = 'explain' | 'fix' | 'optimize';

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | 'run' | null>(null);
  const { toast } = useToast();

  const [executionResult, setExecutionResult] = useState<string[] | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const codeContent = useMemo(() => code.replace(/^```(html|javascript|js)?\n|```$/g, ''), [code]);
  
  const codeType = useMemo(() => {
    if (code.startsWith('```html') || /<[a-z][\s\S]*>/i.test(codeContent)) {
      return 'html';
    }
    return 'javascript';
  }, [code, codeContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunCode = () => {
    setActiveAction('run');
    setAiResponse(null);
    setExecutionError(null);
    setExecutionResult(null);
    setShowPreview(false);

    if (codeType === 'html') {
      setShowPreview(true);
    } else {
      try {
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => JSON.stringify(arg, null, 2)).join(' '));
          originalConsoleLog(...args);
        };
        
        new Function(codeContent)();
        setExecutionResult(logs);
        console.log = originalConsoleLog;

      } catch (error: any) {
        setExecutionError(error.toString());
      }
    }
  };

  const handleAiAction = async (action: AIAction) => {
    setIsLoading(true);
    setAiResponse(null);
    setActiveAction(action);
    setExecutionError(null);
    setExecutionResult(null);
    setShowPreview(false);

    try {
      const response = await processCode({ code: codeContent, task: action });
      setAiResponse(response.result);
    } catch (error) {
      console.error('AI action failed:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'فشل في معالجة الطلب. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearOutput = () => {
    setExecutionResult(null);
    setExecutionError(null);
    setShowPreview(false);
    setAiResponse(null);
    setActiveAction(null);
  }

  const actionConfig: { action: AIAction | 'run'; icon: React.ElementType; label: string }[] = [
    { action: 'run', icon: Play, label: 'تشغيل' },
    { action: 'explain', icon: BrainCircuit, label: 'شرح' },
    { action: 'optimize', icon: Zap, label: 'تحسين' },
    { action: 'fix', icon: Bug, label: 'تصحيح' },
  ];

  const hasOutput = showPreview || executionResult !== null || executionError !== null || aiResponse !== null;

  return (
    <div className="font-code text-sm my-2 w-full max-w-2xl text-left" dir="ltr">
      <Card className="bg-gray-900 text-gray-100 border-gray-700 shadow-lg overflow-hidden">
        <div className="px-4 py-2 flex justify-between items-center bg-gray-800/50 border-b border-gray-700">
          <span className="text-xs text-gray-400 capitalize">{codeType} Code</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700 hover:text-white" onClick={handleCopy}>
            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </Button>
        </div>
        <CardContent className="p-0">
          <pre className="p-4 overflow-x-auto bg-gray-900"><code className={`language-${codeType}`}>{codeContent}</code></pre>
        </CardContent>
        <div className="px-2 py-2 flex items-center gap-1 bg-gray-800/50 border-t border-gray-700">
          {actionConfig.map(({ action, icon: Icon, label }) => (
            <Button
              key={action}
              variant="ghost"
              size="sm"
              onClick={() => (action === 'run' ? handleRunCode() : handleAiAction(action))}
              disabled={isLoading}
              className={cn(
                "flex-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white",
                activeAction === action && "bg-primary/20 text-primary"
              )}
            >
              <Icon size={14} className="mr-2" />
              {label}
            </Button>
          ))}
        </div>
        
        {isLoading && (
          <div className="p-4 text-center text-gray-400 border-t border-gray-700">
            <div className="animate-pulse">جاري المعالجة بواسطة الذكاء الاصطناعي...</div>
          </div>
        )}

        {hasOutput && (
            <div className="border-t border-gray-700" dir="rtl">
                <div className="bg-gray-800/50 px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-primary"/>
                        <h4 className="font-bold text-primary text-sm">
                            {activeAction === 'run' ? 'النتائج' : 'مساعد الذكاء الاصطناعي'}
                        </h4>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearOutput} className="h-7 w-7 text-gray-400 hover:text-white">
                        <X size={16} />
                    </Button>
                </div>
                
                <div className="p-4 bg-black/20 max-h-64 overflow-y-auto">
                    {aiResponse && (
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{aiResponse}</div>
                    )}
                    
                    {showPreview && codeType === 'html' && (
                        <iframe
                            srcDoc={codeContent}
                            title="HTML Preview"
                            sandbox="allow-scripts"
                            className="w-full h-64 border-none bg-white"
                        />
                    )}

                    {executionResult && (
                        <pre className="text-white whitespace-pre-wrap">
                            {executionResult.join('\n') || <span className="text-gray-500">تم التنفيذ بنجاح. لا توجد مخرجات.</span>}
                        </pre>
                    )}
                    
                    {executionError && (
                         <pre className="text-red-400 whitespace-pre-wrap">{executionError}</pre>
                    )}
                </div>
            </div>
        )}
      </Card>
    </div>
  );
};

export default CodeBlock;

    