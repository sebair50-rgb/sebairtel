
'use server';

/**
 * @fileOverview An AI flow for fetching and summarizing news articles.
 *
 * - fetchNews - A function that takes a topic and returns a list of news articles.
 * - NewsRequest - The input type for the fetchNews function.
 * - NewsResponse - The return type for the fetchNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsRequestSchema = z.object({
  topic: z.string().describe('The news topic to search for. Can be general or specific.'),
});
export type NewsRequest = z.infer<typeof NewsRequestSchema>;

const ArticleSchema = z.object({
    title: z.string().describe('The headline of the news article.'),
    summary: z.string().describe('A concise summary of the article, 2-3 sentences long.'),
    source: z.string().describe('The original source of the news (e.g., a known news agency).'),
    url: z.string().url().describe('The URL to the original article.'),
    publishedAt: z.string().describe('The publication date in "Month Day, Year" format (e.g., "August 15, 2024").'),
});

const NewsResponseSchema = z.object({
  articles: z.array(ArticleSchema).describe('A list of 5 recent news articles related to the topic.'),
});
export type NewsResponse = z.infer<typeof NewsResponseSchema>;


export async function fetchNews(input: NewsRequest): Promise<NewsResponse> {
  return newsAnalysisFlow(input);
}

const newsAnalysisPrompt = ai.definePrompt({
  name: 'newsAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash-preview',
  input: { schema: NewsRequestSchema },
  output: { schema: NewsResponseSchema },
  prompt: `You are an expert news analyst. Your task is to find and summarize the 5 most recent, relevant, and important news articles about the given topic. Provide a concise summary for each article and cite a credible source.

Analyze the following topic:
---
{{{topic}}}
---

Based on your analysis, provide a structured list of 5 news articles. Ensure the URL is a valid, real URL to an actual news article from the source you cite. Format the publication date as "Month Day, Year".
`,
});

const newsAnalysisFlow = ai.defineFlow(
  {
    name: 'newsAnalysisFlow',
    inputSchema: NewsRequestSchema,
    outputSchema: NewsResponseSchema,
  },
  async (input) => {
    const { output } = await newsAnalysisPrompt(input);
    if (!output) {
        throw new Error("The AI failed to fetch news for the topic.");
    }
    return output;
  }
);
