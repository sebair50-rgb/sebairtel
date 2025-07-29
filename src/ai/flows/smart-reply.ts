'use server';

/**
 * @fileOverview Smart reply suggestion flow.
 *
 * - smartReplySuggestions - A function that generates smart reply suggestions for a given message.
 * - SmartReplyInput - The input type for the smartReplySuggestions function.
 * - SmartReplyOutput - The return type for the smartReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplyInputSchema = z.object({
  message: z.string().describe('The content of the incoming message.'),
});
export type SmartReplyInput = z.infer<typeof SmartReplyInputSchema>;

const SmartReplyOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested replies.'),
});
export type SmartReplyOutput = z.infer<typeof SmartReplyOutputSchema>;

export async function smartReplySuggestions(input: SmartReplyInput): Promise<SmartReplyOutput> {
  return smartReplyFlow(input);
}

const smartReplyPrompt = ai.definePrompt({
  name: 'smartReplyPrompt',
  input: {schema: SmartReplyInputSchema},
  output: {schema: SmartReplyOutputSchema},
  prompt: `You are a helpful assistant designed to provide smart reply suggestions for incoming messages.

  Given the following message, generate three suggested replies that would be appropriate and helpful.

  Message: {{{message}}}

  Your response should be an array of strings.
  `,
});

const smartReplyFlow = ai.defineFlow(
  {
    name: 'smartReplyFlow',
    inputSchema: SmartReplyInputSchema,
    outputSchema: SmartReplyOutputSchema,
  },
  async input => {
    const {output} = await smartReplyPrompt(input);
    return output!;
  }
);
