
'use server';

/**
 * @fileOverview A flow for generating stickers from text prompts.
 *
 * - generateSticker - Creates a sticker with a transparent background.
 * - StickerRequest - Input for the sticker generation flow.
 * - StickerResponse - Output from the sticker generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StickerRequestSchema = z.object({
  prompt: z.string().describe('A detailed description of the sticker to generate.'),
});
export type StickerRequest = z.infer<typeof StickerRequestSchema>;

const StickerResponseSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated sticker. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type StickerResponse = z.infer<typeof StickerResponseSchema>;

export async function generateSticker(input: StickerRequest): Promise<StickerResponse> {
  return generateStickerFlow(input);
}

const generateStickerFlow = ai.defineFlow(
  {
    name: 'generateStickerFlow',
    inputSchema: StickerRequestSchema,
    outputSchema: StickerResponseSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a cartoon-style sticker of: ${prompt}. The sticker should have a thick white or black border, a die-cut style, and a transparent background (PNG). The main subject should be clear and vibrant.`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Sticker generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
