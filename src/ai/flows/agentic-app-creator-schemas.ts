
import { z } from 'genkit';

/**
 * @fileOverview Zod schemas for the agentic app creator flow.
 * This separates the data structures from the server-side logic.
 */

export const FilesSchema = z.object({
    'package.json': z.string().describe("The full content of the package.json file. Do not add comments."),
    'src/app/globals.css': z.string().describe("The full content of the globals.css file."),
    'src/app/layout.tsx': z.string().describe("The full content of the layout.tsx file."),
    'src/app/page.tsx': z.string().describe("The full content of the page.tsx file."),
});

export type Files = z.infer<typeof FilesSchema>;

export const AgenticRequestSchema = z.object({
  history: z.array(z.any()).describe("The history of the conversation between the user and the AI agent."),
  model: z.string().optional().describe("The AI model to use for the generation."),
});

export type AgenticRequest = z.infer<typeof AgenticRequestSchema>;
