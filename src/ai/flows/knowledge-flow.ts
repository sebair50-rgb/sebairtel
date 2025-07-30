
'use server';

/**
 * @fileOverview An AI flow for summarizing and analyzing text content.
 *
 * - analyzeText - A function that takes text and returns a structured analysis.
 * - KnowledgeAnalysisInput - The input type for the analyzeText function.
 * - KnowledgeAnalysisOutput - The return type for the analyzeText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const KnowledgeAnalysisInputSchema = z.object({
  text: z.string().describe('The text content to analyze.'),
});
export type KnowledgeAnalysisInput = z.infer<typeof KnowledgeAnalysisInputSchema>;

const KnowledgeAnalysisOutputSchema = z.object({
  title: z.string().describe('A concise, compelling title for the provided text.'),
  summary: z.string().describe('A brief, neutral summary of the text, about 2-4 sentences long.'),
  keyPoints: z.array(z.string()).describe('A list of the 3-5 most important bullet points from the text.'),
  analysis: z.string().describe('A deeper analysis of the text, providing context, implications, or further insights.'),
});
export type KnowledgeAnalysisOutput = z.infer<typeof KnowledgeAnalysisOutputSchema>;


export async function analyzeText(input: KnowledgeAnalysisInput): Promise<KnowledgeAnalysisOutput> {
  return knowledgeAnalysisFlow(input);
}

const knowledgeAnalysisPrompt = ai.definePrompt({
  name: 'knowledgeAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: KnowledgeAnalysisInputSchema },
  output: { schema: KnowledgeAnalysisOutputSchema },
  prompt: `You are an expert knowledge assistant. Your task is to analyze any provided text, understand it deeply, and provide a structured, insightful response. The text can be an article, a question, a statement, a business idea, or any other piece of information.

Analyze the following text:
---
{{{text}}}
---

Based on your comprehensive analysis, provide the following in a structured format:
1.  **Title**: Create a short, engaging title that accurately reflects the main topic of the text.
2.  **Summary**: Write a concise, neutral summary of the core message (2-4 sentences).
3.  **Key Points**: Extract a list of the 3 to 5 most important bullet points or takeaways.
4.  **Analysis**: Provide a deeper analysis. This could include the context of the text, its potential implications, underlying themes, or your expert insights on the matter. Be thorough and clear.
`,
});

const knowledgeAnalysisFlow = ai.defineFlow(
  {
    name: 'knowledgeAnalysisFlow',
    inputSchema: KnowledgeAnalysisInputSchema,
    outputSchema: KnowledgeAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await knowledgeAnalysisPrompt(input);
    if (!output) {
        throw new Error("The AI failed to analyze the text.");
    }
    return output;
  }
);
