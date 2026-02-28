
'use server';

/**
 * @fileOverview A flow for generating video from text prompts using Veo.
 *
 * - generateVideo - Creates a video based on a user's description.
 * - VideoRequest - Input for the video generation flow.
 * - VideoResponse - Output from the video generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const VideoRequestSchema = z.object({
  prompt: z.string().describe('A detailed description of the video to generate.'),
});
export type VideoRequest = z.infer<typeof VideoRequestSchema>;

const VideoResponseSchema = z.object({
  videoUrl: z.string().describe("The data URI of the generated video. Expected format: 'data:video/mp4;base64,<encoded_data>'."),
});
export type VideoResponse = z.infer<typeof VideoResponseSchema>;

export async function generateVideo(input: VideoRequest): Promise<VideoResponse> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: VideoRequestSchema,
    outputSchema: VideoResponseSchema,
  },
  async ({ prompt }) => {
    try {
        let { operation } = await ai.generate({
            model: googleAI.model('veo-2.0-generate-001'),
            prompt,
            config: {
              durationSeconds: 5,
              aspectRatio: '16:9',
            },
          });
    
          if (!operation) {
            throw new Error('Expected the model to return an operation');
          }
        
          // Wait until the operation completes. This may take up to a minute.
          while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await ai.checkOperation(operation);
          }
        
          if (operation.error) {
            throw new Error('Failed to generate video: ' + operation.error.message);
          }
        
          const video = operation.output?.message?.content.find((p) => !!p.media);
          if (!video || !video.media) {
            throw new Error('Failed to find the generated video');
          }
    
        // The URL needs the API key appended to be accessed.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY environment variable not set.');
        }
        
        // Using native Node.js fetch (available in Next.js 15 environments)
        const videoDownloadResponse = await fetch(`${video.media.url}&key=${apiKey}`);
        if (!videoDownloadResponse.ok) {
            throw new Error(`Failed to fetch video from storage. Status: ${videoDownloadResponse.statusText}`);
        }
    
        const arrayBuffer = await videoDownloadResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);
        const base64Video = videoBuffer.toString('base64');
        const contentType = video.media.contentType || 'video/mp4';
    
        return { videoUrl: `data:${contentType};base64,${base64Video}` };
    } catch (error: any) {
        // Re-throw the original error to be handled by the frontend
        throw error;
    }
  }
);
