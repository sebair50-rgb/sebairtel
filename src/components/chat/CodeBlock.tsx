
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, BrainCircuit, Bug, Zap } from 'lucide-react';
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
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const { toast } = useToast();

  const codeContent = code.replace(/```/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAiAction = async (action: AIAction) => {
    setIsLoading(true);
    setAiResponse(null);
    setActiveAction(action);
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

  const actionConfig: { action: AIAction; icon: React.ElementType; label: string }[] = [
    { action: 'explain', icon: BrainCircuit, label: 'شرح' },
    { action: 'optimize', icon: Zap, label: 'تحسين' },
    { action: 'fix', icon: Bug, label: 'تصحيح' },
  ];

  return (
    <div className="font-code text-sm my-2 w-full max-w-2xl text-left" dir="ltr">
      <Card className="bg-gray-900 text-gray-100 border-gray-700 shadow-lg">
        <div className="px-4 py-2 flex justify-between items-center bg-gray-800/50 border-b border-gray-700 rounded-t-lg">
          <span className="text-xs text-gray-400">Code Block</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700 hover:text-white" onClick={handleCopy}>
            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </Button>
        </div>
        <CardContent className="p-0">
          <pre className="p-4 overflow-x-auto bg-gray-900"><code className="language-js">{codeContent}</code></pre>
        </CardContent>
        <div className="px-2 py-2 flex items-center gap-1 bg-gray-800/50 border-t border-gray-700 rounded-b-lg">
          {actionConfig.map(({ action, icon: Icon, label }) => (
            <Button
              key={action}
              variant="ghost"
              size="sm"
              onClick={() => handleAiAction(action)}
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
        {aiResponse && (
          <div className="p-4 border-t border-gray-700" dir="rtl">
            <h4 className="font-bold mb-2 text-primary">مساعد الذكاء الاصطناعي:</h4>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{aiResponse}</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CodeBlock;
