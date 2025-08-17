
'use server';

/**
 * @fileOverview A flow for generating basic application boilerplate from a text prompt.
 *
 * - generateApp - Creates a set of files for a simple Next.js application.
 * - AppCreatorRequest - Input for the app generation flow.
 * - AppCreatorResponse - Output from the app generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AppCreatorRequestSchema = z.object({
  prompt: z.string().describe('A detailed description of the application to generate.'),
});
export type AppCreatorRequest = z.infer<typeof AppCreatorRequestSchema>;

const AppCreatorResponseSchema = z.object({
  files: z.object({
    'package.json': z.string().describe("The content of the package.json file."),
    'src/app/globals.css': z.string().describe("The content of the globals.css file."),
    'src/app/layout.tsx': z.string().describe("The content of the layout.tsx file."),
    'src/app/page.tsx': z.string().describe("The content of the page.tsx file."),
  }).describe("A JSON object where keys are filenames and values are the string content of those files."),
});
export type AppCreatorResponse = z.infer<typeof AppCreatorResponseSchema>;

export async function generateApp(input: AppCreatorRequest): Promise<AppCreatorResponse> {
  return generateAppFlow(input);
}

const generateAppPrompt = ai.definePrompt({
    name: 'generateAppPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: AppCreatorRequestSchema },
    output: { schema: AppCreatorResponseSchema },
    prompt: `You are an expert Next.js developer. A user wants to create a new application based on a prompt.
Your task is to generate the basic file structure for a new Next.js application using the App Router.

The user's request is: {{{prompt}}}

Generate the following files:
1.  **package.json**: Include dependencies for Next.js, React, and Tailwind CSS. Add a 'dev' script. Do not include any comments in the JSON.
2.  **src/app/globals.css**: The basic Tailwind CSS directives.
3.  **src/app/layout.tsx**: A root layout with basic HTML structure and Tailwind CSS.
4.  **src/app/page.tsx**: A simple React component for the main page that reflects the user's prompt. Use Tailwind CSS for styling. Use placeholder images from 'https://placehold.co' if needed.

Return the result as a single JSON object where the keys are the full file paths and the values are the complete content of each file as a string.
Do not include any files not explicitly requested.
Ensure all code is valid and well-formatted.
`,
});


const generateAppFlow = ai.defineFlow(
  {
    name: 'generateAppFlow',
    inputSchema: AppCreatorRequestSchema,
    outputSchema: AppCreatorResponseSchema,
  },
  async (input) => {
    const { output } = await generateAppPrompt(input);
    if (!output) {
      throw new Error('Failed to generate the application files.');
    }
    return output;
  }
);
