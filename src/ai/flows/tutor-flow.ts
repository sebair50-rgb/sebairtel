
'use server';

/**
 * @fileOverview An AI tutor flow that provides explanations on various subjects.
 *
 * - askTutor - A function that takes a topic and returns an explanation.
 * - TutorRequest - The input type for the askTutor function.
 * - TutorResponse - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TutorRequestSchema = z.object({
  topic: z.string().describe('The subject or question to be explained.'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).describe('The desired level of complexity for the explanation.'),
});
export type TutorRequest = z.infer<typeof TutorRequestSchema>;

const TutorResponseSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the topic, tailored to the requested level.'),
});
export type TutorResponse = z.infer<typeof TutorResponseSchema>;

export async function askTutor(input: TutorRequest): Promise<TutorResponse> {
  return tutorFlow(input);
}

const tutorPrompt = ai.definePrompt({
    name: 'tutorPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: TutorRequestSchema },
    output: { schema: TutorResponseSchema },
    prompt: `You are an expert educator and AI tutor. Your goal is to explain complex topics in a clear, concise, and engaging way.

The user wants to learn about: {{{topic}}}
Their desired level of understanding is: {{{level}}}

Please provide a detailed explanation of the topic. Structure your response in well-formatted markdown.
- For beginners, use simple language, analogies, and real-world examples. Avoid jargon.
- For intermediate learners, assume some prior knowledge and introduce more technical terms with explanations.
- For advanced learners, provide in-depth details, discuss nuances, and mention relevant theories or advanced concepts.
`,
});


const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorRequestSchema,
    outputSchema: TutorResponseSchema,
  },
  async (input) => {
    const { output } = await tutorPrompt(input);
    if (!output) {
      throw new Error('Failed to get an explanation from the tutor.');
    }
    return output;
  }
);
