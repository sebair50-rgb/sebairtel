
'use server';

/**
 * @fileOverview A flow for creating basic application structures from a text prompt.
 *
 * - generateApp - Creates a set of code files and a preview image based on a user's description.
 * - AppCreatorInput - The input type for the generateApp function.
 * - AppCreatorResponse - The return type for the generateApp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';


// Final response schema including files and the preview image URL
const AppCreatorResponseSchema = z.object({
  files: z.object({
    'package.json': z.string().describe('The content of the package.json file. Do not add comments to the JSON.'),
    'src/app/globals.css': z.string().describe('The content of the globals.css file.'),
    'src/app/layout.tsx': z.string().describe('The content of the layout.tsx file.'),
    'src/app/page.tsx': z.string().describe('The content of the page.tsx file, including JSX and Tailwind CSS classes.'),
  }),
  previewImageUrl: z.string().describe("A data URI of a generated preview image for the application's home page. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type AppCreatorResponse = z.infer<typeof AppCreatorResponseSchema>;

// Input schema for the main flow
const AppCreatorInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the application to generate.'),
});
export type AppCreatorInput = z.infer<typeof AppCreatorInputSchema>;


// Intermediate schema for just the code files
const CodeFilesResponseSchema = AppCreatorResponseSchema.pick({ files: true });


export async function generateApp(input: AppCreatorInput): Promise<AppCreatorResponse> {
  return generateAppFlow(input);
}


// Prompt to generate the code files
const codeGenerationPrompt = ai.definePrompt({
    name: 'appCreatorCodePrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: AppCreatorInputSchema },
    output: { schema: CodeFilesResponseSchema, format: 'json' },
    prompt: `You are an expert Next.js and Tailwind CSS developer. Based on the user's prompt, generate a complete, functional, and production-ready application structure.

    User Prompt: {{{prompt}}}

    Generate the following files:

    1.  **package.json**:
        *   Include standard dependencies for a modern Next.js app: next, react, react-dom.
        *   Include standard dev dependencies: @types/node, @types/react, @types/react-dom, typescript, tailwindcss, postcss, autoprefixer.
        *   Include shadcn/ui dependencies: tailwind-merge, tailwindcss-animate, class-variance-authority, clsx, lucide-react.
        *   Include standard scripts for "dev", "build", "start", and "lint".
        *   **Important**: DO NOT add any comments inside the JSON file.

    2.  **src/app/globals.css**:
        *   Include the three standard Tailwind CSS directives: \`@tailwind base;\`, \`@tailwind components;\`, \`@tailwind utilities;\`.
        *   Define a modern, clean, and professional theme using HSL CSS variables for light and dark modes, including background, foreground, primary, secondary, accent, and card colors. Ensure high contrast and readability.

    3.  **src/app/layout.tsx**:
        *   Create a standard Next.js App Router root layout.
        *   Include a title and description in the metadata that is relevant to the user's prompt.
        *   Import and apply a modern font from Google Fonts (e.g., Inter).
        *   Ensure it has a \`<body>\` tag.

    4.  **src/app/page.tsx**:
        *   Create a visually appealing and functional home page component based on the user's prompt.
        *   Use Tailwind CSS for all styling. Use semantic and clean class names.
        *   Use \`<Image />\` from \`next/image\` for any images. For placeholders, use \`https://placehold.co/WIDTHxHEIGHT.png\`.
        *   Use \`lucide-react\` for icons if applicable.
        *   The generated code should be complete, with no missing imports or syntax errors.
    `,
});

// Main flow that orchestrates code and image generation
const generateAppFlow = ai.defineFlow(
  {
    name: 'generateAppFlow',
    inputSchema: AppCreatorInputSchema,
    outputSchema: AppCreatorResponseSchema,
  },
  async ({ prompt }) => {
    // Step 1: Generate the code files first.
    const { output: codeOutput } = await codeGenerationPrompt({ prompt });
    if (!codeOutput || !codeOutput.files) {
      throw new Error('Failed to generate application code files.');
    }

    const { files } = codeOutput;
    const pageContent = files['src/app/page.tsx'];

    // Step 2: Generate the preview image based on the generated page content.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a clean, high-fidelity preview image that accurately represents the following React component code. The image should look like a screenshot of the rendered UI.
      
      Component Code:
      \`\`\`tsx
      ${pageContent}
      \`\`\``,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate application preview image.');
    }

    // Step 3: Combine and return the final response.
    return {
      files,
      previewImageUrl: media.url,
    };
  }
);
