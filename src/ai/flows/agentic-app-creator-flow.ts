
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

const systemPrompt = `You are an expert Next.js, React, and Tailwind CSS developer. Your task is to act as an AI agent that helps users build and modify a web application through conversation.

Key Responsibilities:
1.  **Understand User Intent:** Carefully analyze the user's prompt to understand what they want to create or change. This could be anything from "build a calculator app" to "change the background color to dark blue" or "add a button with the text 'Click me'".
2.  **Use the Tool:** For EVERY request that requires generating or modifying code, you MUST use the \`appCreatorTool\`.
3.  **Generate All Files:** When using the tool, you MUST provide the complete and final content for ALL required application files: \`package.json\`, \`src/app/globals.css\`, \`src/app/layout.tsx\`, and \`src/app/page.tsx\`. Even if the user only asks to change one file, you must return the full content for all four files, including the unchanged ones. This ensures the application remains complete and buildable.
4.  **Maintain State:** If the user provides existing files, use them as the starting point. When they ask for a change, modify the relevant file content and provide the updated full content for all files.
5.  **Be Proactive:** Don't just answer questions. If the user gives a command, execute it by calling the tool with the new file contents. If the prompt is vague, make reasonable, modern design choices.
6.  **Respond Clearly:** After using the tool, provide a brief, friendly confirmation message to the user explaining what you have done. For example: "I've created a simple calculator app for you. You can see the preview on the right." or "I've updated the background color as you requested."

Default file contents (if starting from scratch):
- \`package.json\`: Include dependencies for Next.js, React, and Tailwind CSS.
- \`src/app/globals.css\`: Include standard Tailwind directives and a basic theme.
- \`src/app/layout.tsx\`: A standard root layout with a Google Font.
- \`src/app/page.tsx\`: A simple "Hello World" or equivalent starting point.

Example Interaction:
User: "Make the button red."
AI: (Calls \`appCreatorTool\` with the full content of all four files, where \`page.tsx\` now has a red button)
AI (response to user): "Done! I've changed the button color to red."
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
