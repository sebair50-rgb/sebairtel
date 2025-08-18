
'use server';

/**
 * @fileOverview A conversational agent flow for creating and modifying web applications.
 *
 * - generateAgenticResponse - Handles the back-and-forth conversation for app creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FilesSchema, Files, AgenticRequestSchema, AgenticRequest } from './agentic-app-creator-schemas';
import type {Part} from 'genkit';

const appCreatorTool = ai.defineTool(
  {
    name: 'appCreatorTool',
    description: 'Creates or updates a set of code files for a web application based on user requirements. Use this tool for every user request that involves generating or changing code.',
    inputSchema: FilesSchema,
    outputSchema: z.void(),
  },
  async () => {
    // This is a pass-through tool. The actual file generation happens in the flow
    // based on the arguments the model decides to pass to this tool.
    // So, this function body is intentionally empty.
  }
);

const systemPrompt = `You are an expert full-stack developer agent. Your name is "CodeCraft AI".
Your primary goal is to help users build and modify web applications using React and Tailwind CSS. You must always communicate with the user in Arabic, as that is their preferred language.

Your workflow:
1.  When the user provides a request, analyze it carefully.
2.  If the request is ambiguous or lacks detail, you MUST ask clarifying questions in Arabic to understand the exact requirements. For example, ask about UI elements, color schemes, functionality, etc.
3.  Once you have a clear plan, use the "appCreatorTool" to write the complete, functional code for the application or component.
4.  You MUST generate the full code for all required files in a single tool call. Do not provide partial code or instructions.
5.  After using the tool, confirm your action to the user in a friendly, professional Arabic message.
6.  Be proactive, helpful, and act like a senior software architect guiding the user.
7.  For every request that requires generating or modifying code, you MUST use the \`appCreatorTool\`.
8.  When using the tool, you MUST provide the complete and final content for ALL required application files: \`package.json\`, \`src/app/globals.css\`, \`src/app/layout.tsx\`, and \`src/app/page.tsx\`. Even if the user only asks to change one file, you must return the full content for all four files, including the unchanged ones. This ensures the application remains complete and buildable.
`;


export async function generateAgenticResponse(input: AgenticRequest) {
  const { history, model } = input;

  const { output } = await ai.generate({
    model: model || 'googleai/gemini-1.5-flash',
    tools: [appCreatorTool],
    system: systemPrompt,
    history,
    config: {
        temperature: 0.1, 
    }
  });

  const toolCalls = output.requests;
  let generatedFiles: Files | undefined = undefined;
  
  // Construct the new history array correctly.
  const newHistory: Part[] = [...history];

  // Add the model's text response and any tool calls to the history.
  newHistory.push({ role: 'model', content: output.content });

  if (toolCalls && toolCalls.length > 0) {
    const toolCall = toolCalls[0];
    if (toolCall.tool.name === 'appCreatorTool') {
        generatedFiles = toolCall.tool.input;
        // Add a placeholder tool response to the history.
        newHistory.push({ role: 'tool', content: { name: 'appCreatorTool', output: undefined } });
    }
  }

  return {
    history: newHistory,
    files: generatedFiles,
    error: output.finishReason !== 'stop' && output.finishReason !== 'toolCalls' ? `AI generation stopped unexpectedly: ${output.finishReason}` : undefined
  };
}
