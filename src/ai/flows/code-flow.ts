
'use server';

/**
 * @fileOverview A flow for processing code snippets with AI.
 *
 * - processCode - A function that takes a code snippet and a task (explain, fix, optimize) and returns the AI's response.
 * - CodeProcessingInput - The input type for the processCode function.
 * - CodeProcessingOutput - The return type for the processCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CodeProcessingInputSchema = z.object({
  code: z.string().describe('The code snippet to process.'),
  task: z.enum(['explain', 'fix', 'optimize']).describe('The task to perform on the code.'),
});
export type CodeProcessingInput = z.infer<typeof CodeProcessingInputSchema>;

const CodeProcessingOutputSchema = z.object({
  result: z.string().describe('The result of the AI processing.'),
});
export type CodeProcessingOutput = z.infer<typeof CodeProcessingOutputSchema>;

export async function processCode(input: CodeProcessingInput): Promise<CodeProcessingOutput> {
  return codeProcessingFlow(input);
}

const getPromptForTask = (task: CodeProcessingInput['task']) => {
  switch (task) {
    case 'explain':
      return 'You are an expert programmer. Explain the following code snippet clearly and concisely. Describe what it does, its inputs, and its outputs.';
    case 'fix':
      return 'You are an expert programmer and debugger. Analyze the following code for any bugs, errors, or inefficiencies. Provide a corrected version of the code and a brief explanation of the fixes.';
    case 'optimize':
      return 'You are an expert programmer specializing in performance. Analyze the following code and suggest optimizations for performance, readability, and best practices. Provide the optimized code and explain the improvements.';
    default:
        throw new Error('Invalid task');
  }
}

const codeProcessingPrompt = ai.definePrompt({
  name: 'codeProcessingPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: CodeProcessingInputSchema.extend({ systemPrompt: z.string() }) },
  output: { schema: CodeProcessingOutputSchema },
  prompt: `{{{systemPrompt}}}

  Here is the code:
  \`\`\`
  {{{code}}}
  \`\`\`

  Provide your response in a clear, well-formatted markdown. If you provide code, use markdown code blocks.
  `,
});

const codeProcessingFlow = ai.defineFlow(
  {
    name: 'codeProcessingFlow',
    inputSchema: CodeProcessingInputSchema,
    outputSchema: CodeProcessingOutputSchema,
  },
  async (input) => {
    const systemPrompt = getPromptForTask(input.task);
    const { output } = await codeProcessingPrompt({ ...input, systemPrompt });
    return output!;
  }
);
