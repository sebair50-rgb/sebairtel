
'use server';

/**
 * @fileOverview Smart reply suggestion flow.
 *
 * - smartReplySuggestions - A function that generates smart reply suggestions for a given message history.
 * - SmartReplyInput - The input type for the smartReplySuggestions function.
 * - SmartReplyOutput - The return type for the smartReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplyInputSchema = z.object({
  history: z.string().describe('The recent conversation history.'),
});
export type SmartReplyInput = z.infer<typeof SmartReplyInputSchema>;

const SmartReplyOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3 short, context-aware suggested replies in English.'),
});
export type SmartReplyOutput = z.infer<typeof SmartReplyOutputSchema>;

export async function smartReplySuggestions(input: SmartReplyInput): Promise<SmartReplyOutput> {
  return smartReplyFlow(input);
}

const smartReplyPrompt = ai.definePrompt({
    name: 'smartReplyPrompt',
    model: 'googleai/gemini-1.5-flash-preview',
    output: {
        schema: SmartReplyOutputSchema,
        format: 'json',
    },
    prompt: `You are an expert chat assistant that specializes in analyzing conversation contexts to provide relevant, smart replies.
Your task is to analyze the following conversation history, understand the relationship and context, and identify the nature of the last message (e.g., is it a question, a statement, a shared image, code, etc.).

Based on your analysis of the full context, generate three short, intelligent, and appropriate replies for the user "You".
The replies must be in English.

Conversation History:
{{{history}}}
    `,
});


const smartReplyFlow = ai.defineFlow(
  {
    name: 'smartReplyFlow',
    inputSchema: SmartReplyInputSchema,
    outputSchema: SmartReplyOutputSchema,
  },
  async ({ history }) => {
    const { output } = await smartReplyPrompt({ history });
    if (!output) {
      throw new Error('Failed to generate smart replies.');
    }
    return output;
  }
);
