
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
            // Check for specific billing error within the operation result
            if (operation.error.message && operation.error.message.includes('billing enabled')) {
                 throw new Error("Video generation with Veo requires a Google Cloud project with billing enabled. Please enable billing in your GCP project to use this feature.");
            }
            throw new Error('Failed to generate video: ' + operation.error.message);
          }
        
          const video = operation.output?.message?.content.find((p) => !!p.media);
          if (!video || !video.media) {
            throw new Error('Failed to find the generated video');
          }
    
        // The media.url from Veo is a temporary gs:// URL.
        // For client-side display, we need to fetch it and convert to a data URI.
        const fetch = (await import('node-fetch')).default;
        const apiKey = process.env.GEMINI_API_KEY;
    
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY environment variable not set.');
        }
        
        // The URL needs the API key appended to be accessed.
        const videoDownloadResponse = await fetch(`${video.media.url}&key=${apiKey}`);
        if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
            throw new Error(`Failed to fetch video from storage. Status: ${videoDownloadResponse.statusText}`);
        }
    
        const videoBuffer = await videoDownloadResponse.buffer();
        const base64Video = videoBuffer.toString('base64');
        const contentType = video.media.contentType || 'video/mp4';
    
        return { videoUrl: `data:${contentType};base64,${base64Video}` };
    } catch (error: any) {
        // Catch errors from the initial ai.generate() call or the polling loop
        if (error.message && error.message.includes('billing enabled')) {
            throw new Error("Video generation with Veo requires a Google Cloud project with billing enabled. Please enable billing in your GCP project to use this feature.");
        }
        // Re-throw other errors
        throw error;
    }
  }
);
