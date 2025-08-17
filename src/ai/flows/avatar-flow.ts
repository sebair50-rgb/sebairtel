
'use server';

/**
 * @fileOverview A flow for generating user avatars from text prompts.
 *
 * - generateAvatar - Creates a square avatar image based on a user's description.
 * - AvatarRequest - Input for the avatar generation flow.
 * - AvatarResponse - Output from the avatar generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AvatarRequestSchema = z.object({
  prompt: z.string().describe('A detailed description of the avatar to generate.'),
});
export type AvatarRequest = z.infer<typeof AvatarRequestSchema>;

const AvatarResponseSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated avatar. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type AvatarResponse = z.infer<typeof AvatarResponseSchema>;

export async function generateAvatar(input: AvatarRequest): Promise<AvatarResponse> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: AvatarRequestSchema,
    outputSchema: AvatarResponseSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a high-quality, artistic, square avatar portrait. The avatar should be a headshot or bust-up view. Style it based on the following description: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // You might add specific config for square aspect ratio if the model supports it,
        // otherwise, we handle it on the frontend.
      },
    });

    if (!media.url) {
      throw new Error('Avatar generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
