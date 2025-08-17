
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

const AppFilesSchema = z.object({
    'package.json': z.string().describe("The content of the package.json file."),
    'src/app/globals.css': z.string().describe("The content of the globals.css file."),
    'src/app/layout.tsx': z.string().describe("The content of the layout.tsx file."),
    'src/app/page.tsx': z.string().describe("The content of the page.tsx file."),
});

const AppCreatorResponseSchema = z.object({
  files: AppFilesSchema.describe("A JSON object where keys are filenames and values are the string content of those files."),
  previewImageUrl: z.string().describe("A data URI of a generated preview image for the application's home page. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type AppCreatorResponse = z.infer<typeof AppCreatorResponseSchema>;

export async function generateApp(input: AppCreatorRequest): Promise<AppCreatorResponse> {
  return generateAppFlow(input);
}

const generateCodePrompt = ai.definePrompt({
    name: 'generateCodePrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: AppCreatorRequestSchema },
    output: { schema: z.object({ files: AppFilesSchema }) },
    prompt: `You are an expert Next.js developer. A user wants to create a new application based on a prompt.
Your task is to generate the complete code for a new Next.js application using the App Router.

The user's request is: {{{prompt}}}

Generate the following files with complete and valid code:
1.  **package.json**: 
    - Include dependencies: "next", "react", "react-dom", "tailwindcss", and "lucide-react".
    - Include devDependencies: "typescript", "@types/node", "@types/react", "@types/react-dom", "postcss", "tailwindcss-animate", "class-variance-authority", "clsx", "tailwind-merge".
    - Include a "dev" script: "next dev".
    - Do NOT include any comments in the JSON file.

2.  **src/app/globals.css**: 
    - Include the standard Tailwind CSS directives: \`@tailwind base;\`, \`@tailwind components;\`, \`@tailwind utilities;\`.
    - Define a root theme with modern HSL CSS variables for light mode: --background, --foreground, --primary, --secondary, --destructive, --muted, --accent, --card. Use a professional and clean color palette. For example, a slate or gray-based theme.

3.  **src/app/layout.tsx**: 
    - Create a standard Next.js root layout for the App Router.
    - Import and apply a font from 'next/font/google', like Inter.
    - Include basic metadata with a sensible title.
    - Import 'globals.css'.
    - Ensure the <html> and <body> tags are present.

4.  **src/app/page.tsx**: 
    - Create a complete and functional React component for the main page that accurately reflects the user's prompt.
    - Use Tailwind CSS for all styling. Create a visually appealing and modern layout.
    - Use placeholder images from 'https://placehold.co' where needed (e.g., \`https://placehold.co/600x400\`).
    - Use 'lucide-react' for icons if any are needed.
    - The code should be complete, with all necessary imports.

Return the result as a single JSON object where the keys are the full file paths and the values are the complete, final content of each file as a string.
Ensure all code is valid, well-formatted, and production-ready.
Do not include any files other than the four specified above.
`,
});

const generateAppFlow = ai.defineFlow(
  {
    name: 'generateAppFlow',
    inputSchema: AppCreatorRequestSchema,
    outputSchema: AppCreatorResponseSchema,
  },
  async (input) => {
    // Step 1: Generate the code files.
    const { output: codeOutput } = await generateCodePrompt(input);
    if (!codeOutput || !codeOutput.files) {
      throw new Error('Failed to generate the application code files.');
    }
    const { files } = codeOutput;

    // Step 2: Generate the preview image based on the generated page.tsx.
    const pageContent = files['src/app/page.tsx'];
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a realistic, high-quality preview image of what this Next.js/Tailwind CSS component would look like in a web browser. The component is defined by the following code:\n\n\`\`\`tsx\n${pageContent}\n\`\`\``,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate a preview image for the application.');
    }

    // Step 3: Combine and return the final response.
    return {
      files,
      previewImageUrl: media.url,
    };
  }
);
