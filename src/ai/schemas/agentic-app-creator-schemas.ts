import { z } from 'genkit';

// Schema for the code files the AI can generate or modify
export const FilesSchema = z.object({
  'package.json': z.string().optional().describe('The content of the package.json file. Do not add comments.'),
  'src/app/globals.css': z.string().optional().describe('The content of the globals.css file.'),
  'src/app/layout.tsx': z.string().optional().describe('The content of the layout.tsx file.'),
  'src/app/page.tsx': z.string().optional().describe('The content of the page.tsx file.'),
}).describe('A map of filenames to their full string content. Only include files that need to be created or updated.');

export type Files = z.infer<typeof FilesSchema>;

// Schema for a single message in the conversation
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Input schema for the conversational flow
export const AppCreatorConversationRequestSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history between the user and the AI.'),
  prompt: z.string().describe('The latest user message.'),
});
export type AppCreatorConversationRequest = z.infer<typeof AppCreatorConversationRequestSchema>;

// Output schema from the conversational flow
export const AppCreatorConversationResponseSchema = z.object({
  response: z.string().describe('The textual response from the AI agent.'),
  generatedFiles: FilesSchema.optional().describe('The files generated or updated by the AI in this turn.'),
});
export type AppCreatorConversationResponse = z.infer<typeof AppCreatorConversationResponseSchema>;
