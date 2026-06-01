'use server';

/**
 * @fileOverview A conversational agent flow for creating and modifying web applications.
 *
 * - generateAgenticResponse - Handles the back-and-forth conversation for app creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AgenticRequest, Files, FilesSchema } from './agentic-app-creator-schemas';

const appCreatorTool = ai.defineTool(
  {
    name: 'appCreatorTool',
    description:
      'Creates or updates a set of code files for a web application based on user requirements. Use this tool for every user request that involves generating or changing code.',
    inputSchema: FilesSchema,
    outputSchema: z.void(),
  },
  async () => undefined
);

const defaultModel = 'googleai/gemini-2.5-flash';

const systemPrompt = `You are an expert full-stack developer agent. Your name is "CodeCraft AI".
Your primary goal is to help users build and modify web applications using React and Tailwind CSS. You must always communicate with the user in Arabic, as that is their preferred language.

Your workflow:
1. When the user provides a request, analyze it carefully.
2. If the request is ambiguous or lacks detail, ask clarifying questions in Arabic.
3. Once you have a clear plan, use the "appCreatorTool" to write the complete, functional code for the application or component.
4. Generate complete code for all required files in a single tool call.
5. After using the tool, confirm your action to the user in a friendly, professional Arabic message.
6. Be proactive, helpful, and act like a senior software architect guiding the user.
7. For every request that requires generating or modifying code, use the appCreatorTool.
8. When using the tool, provide complete final content for: package.json, src/app/globals.css, src/app/layout.tsx, and src/app/page.tsx.`;

const toConversationPrompt = (history: AgenticRequest['history']) => history
  .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
  .join('\n\n');

export async function generateAgenticResponse(input: AgenticRequest) {
  const { history, model } = input;

  const response = await ai.generate({
    model: model || defaultModel,
    tools: [appCreatorTool],
    system: systemPrompt,
    prompt: toConversationPrompt(history),
    config: {
      temperature: 0.1,
    },
  });

  const toolRequest = response.toolRequests.find(
    (request) => request.toolRequest.name === 'appCreatorTool'
  );

  const parsedFiles = toolRequest?.toolRequest.input
    ? FilesSchema.safeParse(toolRequest.toolRequest.input)
    : undefined;

  const generatedFiles: Files | undefined = parsedFiles?.success ? parsedFiles.data : undefined;

  const assistantMessage = generatedFiles
    ? 'تم إنشاء ملفات التطبيق المطلوبة وهي جاهزة للمعاينة والتنزيل.'
    : response.text || 'أحتاج إلى تفاصيل إضافية قبل إنشاء التطبيق.';

  return {
    history: [...history, { role: 'model' as const, content: assistantMessage }],
    files: generatedFiles,
    error: parsedFiles && !parsedFiles.success ? 'AI returned an invalid file payload.' : undefined,
  };
}
