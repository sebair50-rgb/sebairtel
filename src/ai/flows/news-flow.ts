
'use server';

/**
 * @fileOverview An AI flow for summarizing and analyzing news articles from text content.
 *
 * - analyzeNewsArticle - A function that takes article text and returns a structured analysis.
 * - NewsAnalysisInput - The input type for the analyzeNewsArticle function.
 * - NewsAnalysisOutput - The return type for the analyzeNewsArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsAnalysisInputSchema = z.object({
  articleText: z.string().describe('The full text content of the news article.'),
});
export type NewsAnalysisInput = z.infer<typeof NewsAnalysisInputSchema>;

const NewsAnalysisOutputSchema = z.object({
  title: z.string().describe('A concise, compelling headline for the article.'),
  summary: z.string().describe('A brief, neutral summary of the article, about 2-3 sentences long.'),
  keyPoints: z.array(z.string()).describe('A list of 3-5 key bullet points from the article.'),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']).describe('The overall sentiment of the article.'),
  category: z.enum(['Technology', 'Business', 'Sports', 'Health', 'World News', 'Local News', 'Entertainment', 'Science']).describe('The most relevant category for the article.'),
});
export type NewsAnalysisOutput = z.infer<typeof NewsAnalysisOutputSchema>;


export async function analyzeNewsArticle(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
  return newsAnalysisFlow(input);
}

const newsAnalysisPrompt = ai.definePrompt({
  name: 'newsAnalysisPrompt',
  model: 'googleai/gemini-pro',
  input: { schema: NewsAnalysisInputSchema },
  output: { schema: NewsAnalysisOutputSchema },
  prompt: `You are an expert news analyst. Your task is to analyze the provided article text and extract key information in a structured format.

Analyze the following article:
---
{{{articleText}}}
---

Based on your analysis, provide the following:
1.  **Title**: A short, engaging headline that accurately reflects the main topic.
2.  **Summary**: A concise, neutral summary of the article (2-3 sentences).
3.  **Key Points**: A list of the 3 to 5 most important bullet points.
4.  **Sentiment**: The overall sentiment of the article (Positive, Negative, or Neutral).
5.  **Category**: The most fitting category for the news (e.g., Technology, Business, Sports, Health, etc.).
`,
});

const newsAnalysisFlow = ai.defineFlow(
  {
    name: 'newsAnalysisFlow',
    inputSchema: NewsAnalysisInputSchema,
    outputSchema: NewsAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await newsAnalysisPrompt(input);
    if (!output) {
        throw new Error("The AI failed to analyze the article.");
    }
    return output;
  }
);
