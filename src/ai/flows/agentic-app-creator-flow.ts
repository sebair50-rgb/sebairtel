
'use server';

/**
 * @fileOverview An agentic flow for creating and modifying a web application through conversation.
 * This flow uses tools to generate and update code files based on a user's prompts.
 *
 * - converseWithAppCreator - Main function to handle the conversation and tool use.
 * - AppCreatorConversationRequest - Input schema for the conversation.
 * - AppCreatorConversationResponse - Output schema for the conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the code files the AI can generate or modify
const FilesSchema = z.object({
  'package.json': z.string().optional().describe('The content of the package.json file. Do not add comments.'),
  'src/app/globals.css': z.string().optional().describe('The content of the globals.css file.'),
  'src/app/layout.tsx': z.string().optional().describe('The content of the layout.tsx file.'),
  'src/app/page.tsx': z.string().optional().describe('The content of the page.tsx file.'),
}).describe('A map of filenames to their full string content. Only include files that need to be created or updated.');

export type Files = z.infer<typeof FilesSchema>;

// Tool for the AI to generate/update application files
const appCreatorTool = ai.defineTool(
  {
    name: 'appCreatorTool',
    description: 'Generates or updates the necessary files for a web application based on the user\'s request. Use this tool to create or modify the codebase.',
    inputSchema: z.object({ files: FilesSchema }),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ files }) => {
    // In a real scenario, this would write the files to the filesystem.
    // For this simulation, we just acknowledge the "write".
    console.log('AI is updating files:', Object.keys(files));
    return { success: true };
  }
);


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


export async function converseWithAppCreator(input: AppCreatorConversationRequest): Promise<AppCreatorConversationResponse> {
    return agenticAppCreatorFlow(input);
}


// The main agentic flow
const agenticAppCreatorFlow = ai.defineFlow(
  {
    name: 'agenticAppCreatorFlow',
    inputSchema: AppCreatorConversationRequestSchema,
    outputSchema: AppCreatorConversationResponseSchema,
  },
  async ({ history, prompt }) => {
    const model = googleAI.model('gemini-1.5-pro-preview');

    const systemPrompt = `You are an expert AI developer agent. Your task is to help the user build a complete, functional, and production-ready Next.js application based on their requests.

    - **Analyze Requests:** Carefully analyze the user's prompts to understand their requirements for the app's functionality, design, and structure.
    - **Use Your Tools:** When the user asks you to create or modify the application, you MUST use the \`appCreatorTool\` to generate or update the required files. You can update one or more files in a single tool call.
    - **Be Iterative:** The user may provide instructions in multiple steps. Build upon the previous state of the code with each new request.
    - **Respond to the User:** After using the tool (or if you don't need to use a tool), provide a clear, concise text response to the user explaining what you have done or asking for clarification.
    - **File Guidelines:**
      - **package.json**: Include standard dependencies (\`next\`, \`react\`, \`react-dom\`, \`tailwindcss\`) and dev dependencies (\`@types/node\`, etc.).
      - **globals.css**: Include Tailwind directives and define a clean theme using HSL CSS variables.
      - **layout.tsx**: Create a standard Next.js App Router root layout.
      - **page.tsx**: Implement the main UI based on the user's description. Use Tailwind CSS for all styling and make it visually appealing. Use \`https://placehold.co/WIDTHxHEIGHT.png\` for placeholder images.
    
    Start by greeting the user and asking them to describe the application they want to build.`;
    
    // Construct the history for the model, including the new prompt
    const modelHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await ai.generate({
      model,
      tools: [appCreatorTool],
      system: systemPrompt,
      history: modelHistory,
      prompt: prompt,
    });

    const textResponse = result.text;
    const toolCalls = result.requests;
    
    let generatedFiles: Files | undefined = undefined;

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      if (toolCall.tool.name === 'appCreatorTool') {
        generatedFiles = (toolCall.tool.input as { files: Files }).files;
      }
    }

    return {
      response: textResponse,
      generatedFiles,
    };
  }
);
