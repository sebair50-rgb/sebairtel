
'use server';

/**
 * @fileOverview A flow for generating images from text prompts.
 *
 * - generateImage - Creates an image based on a user's description.
 * - ImageRequest - Input for the image generation flow.
 * - ImageResponse - Output from the image generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageRequestSchema = z.object({
  prompt: z.string().describe('A detailed description of the image to generate.'),
});
export type ImageRequest = z.infer<typeof ImageRequestSchema>;

const ImageResponseSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type ImageResponse = z.infer<typeof ImageResponseSchema>;

export async function generateImage(input: ImageRequest): Promise<ImageResponse> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageRequestSchema,
    outputSchema: ImageResponseSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a high-quality, artistic image based on the following description: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
